import { ChatMessage, MainState, MainStateDispatch } from "@/types/MainTypes";
import { RefObject } from "react";

const CHAT_MESSAGES_URL = "/api";
const OPENAI_TIMEOUT_MILLISECONDS = 5_000;
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
  previousMessages: ChatMessage[],
  isLoadingMessage: boolean,
  settings: MainState["settings"]
) => {
  if (isLoadingMessage) {
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
    const messagesToSendToBackend = [...previousMessages.slice(-1), newMessage];

    // Sends a POST request to the backend.
    sendPostRequestWithMultipleMessages(
      messagesToSendToBackend,
      mainStateDispatch,
      settings
    );
  }
};

const handleLLMResponse = async (
  response: Response,
  mainStateDispatch: MainStateDispatch
) => {
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
};

export const sendPostRequestWithMultipleMessages = async (
  messagesToSendToBackend: ChatMessage[],
  mainStateDispatch: MainStateDispatch,
  settings: MainState["settings"]
) => {
  let errorMessage = "";

  mainStateDispatch({
    type: "UPDATE_CHAT_STATE",
    payload: { isLoadingMessage: true },
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("CLEARING TIMEOUT");
      controller.abort();
    }, OPENAI_TIMEOUT_MILLISECONDS);

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
      signal: controller.signal,
    });

    // We have a response! Maybe it's an error, but not worries. We'll handle it below.
    clearTimeout(timeoutId);

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error);
    }

    handleLLMResponse(response, mainStateDispatch);
  } catch (error) {
    errorMessage = "Error: something went wrong.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
  }

  mainStateDispatch({
    type: "UPDATE_CHAT_STATE",
    payload: {
      errorMessage,
      isLoadingMessage: false,
    },
  });
};
