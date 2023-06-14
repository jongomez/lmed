"use client";

import {
  ChatMessage,
  ChatState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";

import { PromptTemplateMap } from "@/utils/promptUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { Loader2, SendIcon } from "lucide-react";
import { MutableRefObject, RefObject, memo, useEffect, useRef } from "react";
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
    if (newMessage.content.length > MAX_CHARS) {
      mainStateDispatch({
        type: "UPDATE_CHAT_STATE",
        payload: {
          errorMessage: `Please enter a message with ${MAX_CHARS} characters or less.`,
        },
      });

      return;
    }

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
    sendMessages(messagesToSendToBackend, mainStateDispatch, settings);
  }
};
const sendMessages = async (
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

type ChatProps = {
  mainStateDispatch: MainStateDispatch;
  promptTemplateMap: PromptTemplateMap;
  promptSuggestion: string;
  className: string;
  isChatActive: boolean;
  settings: MainState["settings"];
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  chatState: ChatState;
};

export const Chat = ({
  mainStateDispatch,
  promptTemplateMap,
  promptSuggestion,
  className,
  isChatActive,
  settings,
  chatState,
  fileEditorRef,
}: ChatProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // The following useEffect is used to scroll to the bottom of the text area.
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = promptSuggestion;
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [textAreaRef, promptSuggestion]);

  const { isLoadingMessage, messages } = chatState;
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
                  mainStateDispatch,
                  messages,
                  isLoadingMessage,
                  settings
                );
              }
            }}
            onChange={(e) => {
              mainStateDispatch({
                type: "UPDATE_CHAT_STATE",
                payload: { textAreaValue: e.target.value },
              });
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
                    mainStateDispatch,
                    messages,
                    isLoadingMessage,
                    settings
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
