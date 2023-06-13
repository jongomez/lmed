"use client";

import { ChatMessage, MainState, MainStateDispatch } from "@/types/MainTypes";

import { Loader2, SendIcon } from "lucide-react";

import { ChatHookReturnType, useChat } from "@/utils/hooks/useChat";
import { PromptTemplateMap } from "@/utils/promptUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject, memo, useEffect, useRef } from "react";
import { ChatErrors } from "./ChatErrors.client";
import { PromptUI } from "./PromptUI.client";

const CHAT_MESSAGES_URL = "/api";
const OPENAI_TIMEOUT_MILLISECONDS = 5_000;
export const MAX_CHARS = 999_999;

export type ChatServerResponse =
  | string
  | {
      error: string;
    };

// This function is called when a user wants to send a message to the backend. It does the following:
// 1. Appends the user's message to the existing messages array. This shows the message in the chat's scroll view.
// 2. Sends a POST request to the backend and waits for the server side events.
const sendChatMessage = (
  textAreaRef: ChatHookReturnType["textAreaRef"],
  setChatState: ChatHookReturnType["setChatState"],
  appendBotMessage: ChatHookReturnType["appendBotMessage"],
  appendUserMessage: ChatHookReturnType["appendUserMessage"],
  isLoadingMessage: boolean,
  settings: MainState["settings"],
  onMessageReceived: OnMessageReceivedFunction
) => {
  if (isLoadingMessage) {
    return;
  }

  const textInput = textAreaRef?.current?.value;

  if (textAreaRef?.current && textInput) {
    if (textInput.length > MAX_CHARS) {
      setChatState((currentState) => {
        return {
          ...currentState,
          errorMessage: `Please enter a message with ${MAX_CHARS} characters or less.`,
        };
      });
      return;
    }

    // TODO: Only clear the text area if user is using a custom prompt (e.g. has manually modified a prompt).
    textAreaRef.current.value = "";
    textAreaRef.current.focus();

    // Gets the last X messages to send to the backend.
    const allMessages = appendUserMessage(textInput);
    const messagesToSendToBackend = allMessages.slice(-2);

    // Sends a POST request to the backend.
    sendMessages(
      messagesToSendToBackend,
      setChatState,
      appendBotMessage,
      settings,
      onMessageReceived
    );
  }
};
const sendMessages = async (
  messagesToSendToBackend: ChatMessage[],
  setChatState: ChatHookReturnType["setChatState"],
  appendBotMessage: ChatHookReturnType["appendBotMessage"],
  settings: MainState["settings"],
  onMessageReceived: OnMessageReceivedFunction
) => {
  let errorMessage = "";

  setChatState((currentState) => ({
    ...currentState,
    isLoadingMessage: true,
  }));

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

    if (!response.body) {
      throw new Error("Response body is undefined.");
    }

    const reader = response.body.getReader();
    let completeResponse = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Convert Uint8Array to string and append to completeResponse
      let chunk = new TextDecoder().decode(value);
      completeResponse += chunk;

      // Append each chunk from the server to the chat.
      appendBotMessage({ content: completeResponse, role: "assistant" });
    }

    // We're done! Let's see what we can do with the response.
    onMessageReceived(completeResponse);
  } catch (error) {
    errorMessage = "Error: something went wrong.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
  }

  setChatState((currentState) => ({
    ...currentState,
    errorMessage,
    isLoadingMessage: false,
  }));
};

type PrintMessagesProps = {
  messages: ChatMessage[];
};

const PrintMessages = memo(function PrintMessages({
  messages,
}: PrintMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  return (
    <>
      {messages.map((message, index) => {
        const isBot = message.role === "assistant";
        const contentLines = message.content.split(/\n+/);

        return (
          <div
            className={`
              ${isBot ? "bg-secondary-colors" : "bg-tertiary-colors"} 
              mb-2 mr-2 rounded-md
              border-innactive-colors
              border-[1px]
            `}
            key={index}
          >
            {contentLines.map((line, lineIndex) => (
              <div
                className={`
                  main-text-colors
                  py-2 px-2.5`}
                key={`${index}-${lineIndex}`}
              >
                <div className="font-semibold">
                  {" "}
                  {lineIndex === 0 && (isBot ? "LLM:" : "You:")}
                </div>{" "}
                {line}
              </div>
            ))}
          </div>
        );
      })}
      <div ref={endRef} /> {/* Invisible div for auto scrolling purposes */}
    </>
  );
});

type OnMessageReceivedFunction = (completeResponse: string) => void;

type ChatProps = {
  mainStateDispatch: MainStateDispatch;
  promptTemplateMap: PromptTemplateMap;
  promptSuggestion: string;
  className: string;
  isChatActive: boolean;
  settings: MainState["settings"];
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const Chat = ({
  mainStateDispatch,
  promptTemplateMap,
  promptSuggestion,
  className,
  isChatActive,
  settings,
  fileEditorRef,
}: ChatProps) => {
  const {
    chatState,
    setChatState,
    textAreaRef,
    messagesContainerRef,
    appendBotMessage,
    appendUserMessage,
  } = useChat(promptSuggestion);

  const onMessageReceived = (completeResponse: string) => {
    mainStateDispatch({
      type: "HANDLE_LLM_RESPONSE",
      payload: {
        response: completeResponse,
        fileEditorRef: fileEditorRef.current,
      },
    });
  };

  const { isLoadingMessage } = chatState;
  const iconSize = 26;

  return (
    <div
      className={`
        ${className}
        ${isChatActive ? "flex" : "hidden"}
        flex-col
        p-2
        overflow-auto
        justify-between
      `}
    >
      <div
        ref={messagesContainerRef}
        // className="bg-gray-200 mb-2 rounded-lg overflow-y-scroll w-full"
        className="mb-2 overflow-auto"
      >
        <PrintMessages messages={chatState.messages} />
      </div>

      <div>
        <PromptUI
          promptTemplateMap={promptTemplateMap}
          mainStateDispatch={mainStateDispatch}
          className="row-start-3 col-start-3 flex overflow-auto"
        />
        <div
          className="bg-tertiary-colors
          relative flex items-center w-full h-40 
          rounded-md
          py-1 pl-3
          shadow-md
          border-[1px] border-innactive-colors
          "
        >
          <textarea
            ref={textAreaRef}
            className="resize-none 
            h-full w-full
            outline-none
            main-text-colors
            bg-transparent
            pr-12
            
            "
            placeholder={
              chatState.isLoadingMessage
                ? "Loading message..."
                : "Type message here"
            }
            disabled={chatState.isLoadingMessage}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage(
                  textAreaRef,
                  setChatState,
                  appendBotMessage,
                  appendUserMessage,
                  isLoadingMessage,
                  settings,
                  onMessageReceived
                );
              }
            }}
            onChange={(e) => {
              setChatState({ ...chatState, charCount: e.target.value.length });
            }}
          />

          <div className="absolute right-5 bottom-3">
            {isLoadingMessage ? (
              <div
                className="ml-2 p-1 flex items-center justify-center
              main-text-colors rounded-full
              animate-spin"
              >
                <Loader2 size={iconSize} />
              </div>
            ) : (
              <button
                className="ml-2 bg-blue-500 text-white rounded-md p-1"
                onClick={() =>
                  sendChatMessage(
                    textAreaRef,
                    setChatState,
                    appendBotMessage,
                    appendUserMessage,
                    isLoadingMessage,
                    settings,
                    onMessageReceived
                  )
                }
              >
                <SendIcon size={iconSize} />
              </button>
            )}
          </div>
        </div>

        <ChatErrors
          errorMessage={chatState.errorMessage}
          charCount={chatState.charCount}
        />
      </div>
    </div>
  );
};
