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
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChatErrors } from "./ChatErrors.client";
import { PromptUI } from "./PromptUI.client";

const messageBaseClasses =
  "mb-2 mr-2 rounded-md border-innactive-colors border-[1px]";
const messageHeaderClasses = "font-semibold main-text-colors py-2 px-2.5";

type SingleMessageProps = {
  message: ChatMessage;
  messageIndex: number;
};

const UserMessage = ({ message, messageIndex }: SingleMessageProps) => {
  const lines = message.content.split("\n");

  return (
    <div
      className={`${messageBaseClasses} bg-tertiary-colors pb-2`}
      key={messageIndex}
    >
      <div className={messageHeaderClasses}>User:</div>

      {lines.map((line, lineIndex) => {
        return (
          <div className="main-text-colors px-2.5 " key={lineIndex}>
            {line === "" ? <br /> : line}
          </div>
        );
      })}
    </div>
  );
};

const LLMMessage = ({ message, messageIndex }: SingleMessageProps) => {
  return (
    <div
      className={`${messageBaseClasses} bg-secondary-colors`}
      key={messageIndex}
    >
      <div className={messageHeaderClasses}>LLM:</div>

      <ReactMarkdown
        className="main-text-colors px-2.5 pb-2"
        components={{
          code({ node, inline, className, children, ...props }) {
            const languageRegExResult = /language-(\w+)/.exec(className || "");

            return (
              <SyntaxHighlighter
                {...props}
                style={okaidia}
                language={languageRegExResult?.[1]}
                PreTag="div"
              >
                {/* {String(children).replace(/\n$/, "")} */}
                {String(children)}
              </SyntaxHighlighter>
            );
          },
          p(props) {
            // HACK ALERT: This code is used to prevent:
            // Warning: validateDOMNesting(...): <div> cannot appear as a descendant of <p>.
            // XXX: If for some reason the llm responses are not rendering correctly, LOOK HERE FIRST.
            return <div {...props} />;
          },
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  );
};

type ChatMessagesProps = {
  messages: ChatMessage[];
};

const ChatMessages = memo(function ChatMessages({
  messages,
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
            <LLMMessage message={message} messageIndex={index} key={index} />
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
        content: "```console.log('heyy')```",
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
        <ChatMessages messages={chatState.messages} />
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
        />
      </div>
    </div>
  );
};
