"use client";

import { ChatMessage, MainStateDispatch } from "@/types/MainTypes";

import { Loader, SendIcon } from "lucide-react";

import { ChatHookReturnType, useChat } from "@/utils/hooks/useChat";
import { PromptTemplateMap } from "@/utils/promptUtils";
import { memo } from "react";
import { ChatErrors } from "./ChatErrors.client";
import { PromptUI } from "./PromptUI.client";

const CHAT_MESSAGES_URL = "/api/chat";
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
const send = (
  textAreaRef: ChatHookReturnType["textAreaRef"],
  setChatState: ChatHookReturnType["setChatState"],
  appendBotMessage: ChatHookReturnType["appendBotMessage"],
  appendUserMessage: ChatHookReturnType["appendUserMessage"],
  isLoadingMessage: boolean
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

    textAreaRef.current.value = "";
    textAreaRef.current.focus();

    // Gets the last 2 messages to send to the backend.
    const allMessages = appendUserMessage(textInput);
    const messagesToSendToBackend = allMessages.slice(-2);

    // Sends a POST request to the backend.
    sendMessages(messagesToSendToBackend, setChatState, appendBotMessage);
  }
};

const sendMessages = async (
  messagesToSendToBackend: ChatMessage[],
  setChatState: ChatHookReturnType["setChatState"],
  appendBotMessage: ChatHookReturnType["appendBotMessage"]
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
      body: JSON.stringify(
        messagesToSendToBackend.map((message) => {
          return { content: message.content, role: message.role };
        })
      ),
      signal: controller.signal,
    });

    // We have a response! Maybe it's an error, but not worries. We'll handle it below.
    clearTimeout(timeoutId);

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error);
    }

    const jsonResponse = await response.json();

    // Append the text to the chat's scroll view.
    appendBotMessage({ content: jsonResponse.text, role: "assistant" });
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
  return (
    <>
      {messages.map((message, index) => {
        const isBot = message.role === "assistant";
        const contentLines = message.content.split(/\n+/);

        return contentLines.map((line, lineIndex) => (
          <div
            style={{
              backgroundColor: isBot ? `rgba(230, 230, 230)` : undefined,
            }}
            className="py-2 px-2.5"
            key={`${index}-${lineIndex}`}
          >
            <div className="font-semibold text-messageColor">
              {" "}
              {lineIndex === 0 && (isBot ? "LLM:" : "You:")}
            </div>{" "}
            {line}
          </div>
        ));
      })}
    </>
  );
});

type ChatProps = {
  mainStateDispatch: MainStateDispatch;
  promptTemplateMap: PromptTemplateMap;
  promptSuggestion: string;
  className: string;
  isChatActive: boolean;
};

export const Chat = ({
  mainStateDispatch,
  promptTemplateMap,
  promptSuggestion,
  className,
  isChatActive,
}: ChatProps) => {
  const {
    chatState,
    setChatState,
    textAreaRef,
    messagesContainerRef,
    appendBotMessage,
    appendUserMessage,
  } = useChat();

  const { isLoadingMessage } = chatState;

  // Constant numbers:
  const iconSize = 26;

  return (
    <div
      className={`
        ${className}
        ${isChatActive ? "flex" : "hidden"}
        flex-col items-center justify-end
      `}
    >
      <PromptUI
        promptTemplateMap={promptTemplateMap}
        mainStateDispatch={mainStateDispatch}
        className="row-start-3 col-start-3 flex overflow-auto"
      />

      <div
        ref={messagesContainerRef}
        className="bg-gray-200 mb-2 rounded-lg overflow-y-scroll w-full"
      >
        <PrintMessages messages={chatState.messages} />
      </div>

      <div className="flex items-center w-full">
        <textarea
          ref={textAreaRef}
          className="h-14 w-full placeholder-gray-500 bg-white text-gray-900"
          placeholder={
            chatState.isLoadingMessage
              ? "Loading message..."
              : "Type message here"
          }
          disabled={chatState.isLoadingMessage}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(
                textAreaRef,
                setChatState,
                appendBotMessage,
                appendUserMessage,
                isLoadingMessage
              );
            }
          }}
          onChange={(e) =>
            setChatState({ ...chatState, charCount: e.target.value.length })
          }
        />

        {isLoadingMessage ? (
          <div className="ml-2 flex items-center justify-center text-gray-600 bg-gray-200 rounded-full">
            <Loader size={iconSize} />
          </div>
        ) : (
          <button
            className="ml-2 bg-blue-500 text-white rounded-full"
            onClick={() =>
              send(
                textAreaRef,
                setChatState,
                appendBotMessage,
                appendUserMessage,
                isLoadingMessage
              )
            }
          >
            <SendIcon size={iconSize} />
          </button>
        )}
      </div>

      <ChatErrors
        errorMessage={chatState.errorMessage}
        charCount={chatState.charCount}
      />
    </div>
  );
};
