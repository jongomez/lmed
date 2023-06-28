import {
  ChatMessage,
  ChatState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject, RefObject } from "react";
import { extractCodeBlocksFromMarkdown } from "./LLMResponseUtils";
import {
  PromptTemplate,
  PromptTemplateMap,
  applyPromptTemplate,
} from "./promptUtils";

const CHAT_MESSAGES_URL = "/api";
const OPENAI_TIMEOUT_MILLISECONDS = 10_000;
export const MAX_CHARS = 999_999;

export type ChatServerResponse =
  | string
  | {
      error: string;
    };

const validateMessageLength = (
  newMessage: ChatMessage,
  mainStateDispatch: MainStateDispatch
): boolean => {
  if (newMessage.content.length > MAX_CHARS) {
    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        errorMessage: `Please enter a message with ${MAX_CHARS} characters or less.`,
      },
    });
    return false;
  }
  return true;
};

export const sendChatMessage = (
  textAreaRef: RefObject<HTMLTextAreaElement>,
  mainStateDispatch: MainStateDispatch,
  chatState: ChatState,
  settings: MainState["settings"]
) => {
  if (chatState.isLoadingMessage) {
    return;
  }

  const newMessage: ChatMessage = {
    content: textAreaRef?.current?.value || "",
    role: "user",
  };

  if (textAreaRef?.current && newMessage.content) {
    if (!validateMessageLength(newMessage, mainStateDispatch)) return;

    // TODO (maybe?): Only clear the text area if user is using a custom prompt (e.g. has manually modified a prompt).
    textAreaRef.current.value = "";
    textAreaRef.current.focus();

    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: { newMessage },
    });

    // Currently only send 2 messages to the backend: the previous message and the new message.
    const messagesToSendToBackend = [
      ...chatState.messages.slice(-1),
      newMessage,
    ];

    // Sends a POST request to the backend.
    sendPostRequestWithMultipleMessages(
      messagesToSendToBackend,
      mainStateDispatch,
      chatState,
      settings
    );
  }
};

const handleLLMResponse = async (
  response: Response,
  mainStateDispatch: MainStateDispatch
): Promise<string> => {
  if (!response.body) {
    throw new Error("Response body is undefined.");
  }

  const reader = response.body.getReader();
  let responseChunks = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    // Convert Uint8Array to string and append to completeResponse
    let chunk = new TextDecoder().decode(value);
    responseChunks += chunk;

    // Append each chunk from the server to the chat.
    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        newMessage: { content: responseChunks, role: "assistant" },
      },
    });
  }

  return responseChunks;
};

export const sendPostRequestWithMultipleMessages = async (
  messagesToSendToBackend: ChatMessage[],
  mainStateDispatch: MainStateDispatch,
  chatState: ChatState,
  settings: MainState["settings"]
): Promise<string> => {
  let errorMessage = "";
  let finalLLMMessage = "";

  if (chatState.isLoadingMessage && chatState.abortController) {
    console.log("Aborting previous request.");
    chatState.abortController.abort("New request sent - aborting previous.");
  }

  try {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Request took too long. Aborting.");
      abortController.abort("Request took too long. Aborting.");
    }, OPENAI_TIMEOUT_MILLISECONDS);

    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        isLoadingMessage: true,
        abortController: abortController,
      },
    });

    const response = await fetch(CHAT_MESSAGES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messagesToSendToBackend.map((message) => {
          return { content: message.content, role: message.role };
        }),
        keys: [settings.openAIAPIKey],
      }),
      signal: abortController.signal,
    });

    // We have a response! Maybe it's an error, but not worries. We'll handle it below.
    clearTimeout(timeoutId);

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error);
    }

    finalLLMMessage = await handleLLMResponse(response, mainStateDispatch);
  } catch (error) {
    errorMessage = "Error: something went wrong.";

    if (error instanceof Error) {
      if (error.message.includes("abort")) {
        errorMessage =
          "Request aborted due to timeout. This could be due to an incorrect OpenAI API key or internet connectivity issues.";
      } else {
        errorMessage = error.message;
      }
    }
  }

  mainStateDispatch({
    type: "UPDATE_CHAT_STATE",
    payload: {
      errorMessage,
      isLoadingMessage: false,
    },
  });

  return finalLLMMessage;
};

export const fetchInlineSuggestion = async (
  mainStateDispatch: MainStateDispatch,
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>,
  defaultPromptTemplateMap: PromptTemplateMap,
  chatState: ChatState,
  settings: MainState["settings"]
): Promise<string> => {
  const lineCompletionPrompt = applyPromptTemplate(
    fileEditorRef,
    defaultPromptTemplateMap.get("Line completion") as PromptTemplate
  );

  const newMessage: ChatMessage = {
    content: lineCompletionPrompt,
    role: "user",
  };

  // Add the prompt user message to the chat state.
  mainStateDispatch({
    type: "UPDATE_CHAT_STATE",
    payload: { newMessage },
  });

  // Currently only send 2 messages to the backend: the previous message and the new message.
  const messagesToSendToBackend: ChatMessage[] = [
    ...chatState.messages.slice(-1),
    newMessage,
  ];

  const llmResponse = await sendPostRequestWithMultipleMessages(
    messagesToSendToBackend,
    mainStateDispatch,
    chatState,
    settings
  );

  // Mock llmResponses:
  // const llmResponse =
  //   '```typescript\ncase "James":\n  console.log("James");\n  break;\n```';

  const codeBlocks = extractCodeBlocksFromMarkdown(llmResponse);

  console.log("finalCode", codeBlocks[0]);

  return codeBlocks[0] || "";
};
