"use client";

import { ChatMessage } from "@/types/MainTypes";
import { UserMessageHeader } from "./MessageHeaders.client";

export const messageBaseClasses =
  "mb-2 mr-2 rounded-md border-innactive-colors border-[1px]";

type UserMessageProps = {
  message: ChatMessage;
  messageIndex: number;
};

export const UserMessage = ({ message, messageIndex }: UserMessageProps) => {
  const lines = message.content.split("\n");

  return (
    <div
      className={`${messageBaseClasses} bg-tertiary-colors pb-2`}
      key={messageIndex}
    >
      <UserMessageHeader />

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
