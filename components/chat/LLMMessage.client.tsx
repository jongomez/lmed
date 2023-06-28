"use client";

import { ChatMessage } from "@/types/MainTypes";
import { toString } from "mdast-util-to-string";

import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject, useState } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CodeBlockHeader } from "./CodeBlockHeader.server";
import { LLMMessageHeader } from "./MessageHeaders.client";
import { messageBaseClasses } from "./UserMessage.server";

type LLMMessageProps = {
  message: ChatMessage;
  messageIndex: number;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const LLMMessage = ({
  message,
  messageIndex,
  fileEditorRef,
}: LLMMessageProps) => {
  const [messageMode, setMessageMode] = useState<"raw" | "markdown">(
    "markdown"
  );

  return (
    <div
      className={`${messageBaseClasses} bg-secondary-colors`}
      key={messageIndex}
    >
      <LLMMessageHeader
        setMessageMode={setMessageMode}
        // messageMode={messageMode}
      />

      {messageMode === "markdown" ? (
        <ReactMarkdown
          className="main-text-colors px-2.5 pb-2"
          components={{
            code({ node, inline, className, children, ...props }) {
              const languageRegExResult = /language-(\w+)/.exec(
                className || ""
              );

              // If the code is meant to be inline, return a simple span.
              if (inline) {
                return (
                  <span {...props} className="font-bold">
                    `{children}`
                  </span>
                );
              }

              return (
                <>
                  <CodeBlockHeader
                    fileEditorRef={fileEditorRef}
                    code={toString(node)}
                  />
                  <SyntaxHighlighter
                    {...props}
                    customStyle={{
                      marginTop: 0,
                      borderTopRightRadius: 0,
                      borderTopLeftRadius: 0,
                    }}
                    style={okaidia}
                    language={languageRegExResult?.[1]}
                    PreTag="div"
                    className="mt-0"
                  >
                    {/* {String(children).replace(/\n$/, "")} */}
                    {String(children)}
                  </SyntaxHighlighter>
                </>
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
        <pre className="main-text-colors overflow-auto">
          {message.content.replace(/\n/g, "\\n")}
        </pre>
      )}
    </div>
  );
};
