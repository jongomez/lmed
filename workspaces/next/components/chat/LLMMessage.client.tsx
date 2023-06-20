"use client";

import { ChatMessage } from "@/types/MainTypes";

import { useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import { LLMMessageHeader } from "./MessageHeaders.client";
import { messageBaseClasses } from "./UserMessage.server";

type LLMMessageProps = {
  message: ChatMessage;
  messageIndex: number;
};

export const LLMMessage = ({ message, messageIndex }: LLMMessageProps) => {
  const [messageMode, setMessageMode] = useState<"raw" | "markdown">(
    "markdown"
  );

  return (
    <div
      className={`${messageBaseClasses} bg-secondary-colors`}
      key={messageIndex}
    >
      <LLMMessageHeader setMessageMode={setMessageMode} />

      {messageMode === "markdown" ? (
        <ReactMarkdown
          className="main-text-colors px-2.5 pb-2"
          components={{
            code({ node, inline, className, children, ...props }) {
              const languageRegExResult = /language-(\w+)/.exec(
                className || ""
              );

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
      ) : (
        <pre>{message.content.replace(/\n/g, "\\n")}</pre>
      )}
    </div>
  );
};
