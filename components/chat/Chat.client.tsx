"use client";

import {
  ChatMessage,
  ChatState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";

import { sendChatMessage } from "@/utils/chat/messageHandlingUtils";
import { PromptTemplateMap } from "@/utils/chat/promptUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { Loader2, SendIcon } from "lucide-react";
import { MutableRefObject, memo, useEffect, useRef } from "react";
import { PromptUI } from "../PromptUI.server";
import { ChatErrors } from "./ChatErrors.server";
import { LLMMessage } from "./LLMMessage.client";
import { UserMessage } from "./UserMessage.server";

type ChatMessagesProps = {
  messages: ChatMessage[];
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

const ChatMessages = memo(function ChatMessages({
  messages,
  fileEditorRef,
}: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  return (
    <>
      {messages.map((message, index) => {
        if (message.role === "assistant") {
          return (
            <LLMMessage
              message={message}
              messageIndex={index}
              key={index}
              fileEditorRef={fileEditorRef}
            />
          );
        } else {
          return (
            <UserMessage message={message} messageIndex={index} key={index} />
          );
        }
      })}
      <div ref={endRef} /> {/* Invisible div for auto scrolling purposes */}
    </>
  );
});

type ChatTextAreProps = {
  mainStateDispatch: MainStateDispatch;
  chatState: ChatState;
  settings: MainState["settings"];
  promptSuggestion: string;
};

export const ChatTextArea = ({
  mainStateDispatch,
  chatState,
  settings,
  promptSuggestion,
}: ChatTextAreProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { isLoadingMessage } = chatState;
  const iconSize = 26;

  // The following useEffect is used to scroll to the bottom of the text area.
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = promptSuggestion;
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [textAreaRef, promptSuggestion]);

  // For debugging purposes - show and initial chat message.
  // A useEffect is used to prevent hydration errors.
  useEffect(() => {
    const dummyInitialMessages: ChatMessage[] = [
      { role: "assistant", content: "Hey, how's it going?" },
      {
        role: "assistant",
        content: "```\nconsole.log('heyy')\n```",
        // content: "```console.log('heyy')```",
        // content:
        //   'You can achieve this by first rendering the component that contains the `Tab` component, and then querying for all the `Tab` components using `getAllByRole` with the `role` set to `"tab"`. You can then check if the length of the resulting array is greater than or equal to 3. Here\'s an example:\n\n```\nimport { render } from "@testing-library/react";\n\nit("renders at least 3 open tabs", () => {\n  const { getAllByRole } = render(<TabsComponent />);\n  const tabs = getAllByRole("tab");\n  expect(tabs.length).toBeGreaterThanOrEqual(3);\n});\n```\n\nNote that you\'ll need to replace `TabsComponent` with the actual component that contains the `Tab` component.',
      },
    ];

    mainStateDispatch({
      type: "UPDATE_CHAT_STATE",
      payload: {
        newMessage: dummyInitialMessages[1],
        isLoadingMessage: false,
      },
    });
  }, [mainStateDispatch]);

  return (
    <div
      className="bg-tertiary-colors
                  relative flex items-center w-full h-40 
                  rounded-md
                  py-1 pl-3
                  shadow-md
                  border-[1px] border-innactive-colors"
    >
      <textarea
        ref={textAreaRef}
        className="resize-none 
                    h-full w-full
                    outline-none
                    main-text-colors
                    bg-transparent
                    pr-12"
        placeholder={
          isLoadingMessage ? "Loading message..." : "Type message here"
        }
        disabled={isLoadingMessage}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage(
              textAreaRef,
              mainStateDispatch,
              chatState,
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
                chatState,
                settings
              )
            }
          >
            <SendIcon size={iconSize} />
          </button>
        )}
      </div>
    </div>
  );
};

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
        <ChatMessages
          messages={chatState.messages}
          fileEditorRef={fileEditorRef}
        />
      </div>

      <div>
        <PromptUI
          promptTemplateMap={promptTemplateMap}
          mainStateDispatch={mainStateDispatch}
          className="row-start-3 col-start-3 flex overflow-auto"
        />

        <ChatTextArea
          mainStateDispatch={mainStateDispatch}
          chatState={chatState}
          settings={settings}
          promptSuggestion={promptSuggestion}
        />

        <ChatErrors
          errorMessage={chatState.errorMessage}
          charCount={chatState.charCount}
          mainStateDispatch={mainStateDispatch}
        />
      </div>
    </div>
  );
};
