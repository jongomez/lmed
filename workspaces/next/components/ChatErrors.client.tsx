import { ReactNode } from "react";
import { MAX_CHARS } from "./Chat.client";

type ChatErrorTextComponentProps = {
  children: ReactNode;
};

const ChatErrorTextComponent = ({ children }: ChatErrorTextComponentProps) => {
  return <div className="text-red-500 mt-4 mb-2 text-center">{children}</div>;
};

type ChatErrorsProps = {
  errorMessage: string;
  charCount: number;
};

export const ChatErrors = ({ errorMessage, charCount }: ChatErrorsProps) => {
  if (errorMessage) {
    return <ChatErrorTextComponent>{errorMessage}</ChatErrorTextComponent>;
  }

  if (charCount > MAX_CHARS) {
    return (
      <ChatErrorTextComponent>
        {`Please enter a message with ${MAX_CHARS} characters or less.`}
      </ChatErrorTextComponent>
    );
  }

  return null;
};
