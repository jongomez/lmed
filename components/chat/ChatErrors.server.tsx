import { MainStateDispatch } from "@/types/MainTypes";
import { MAX_CHARS } from "@/utils/chat/messageHandlingUtils";
import { MISSING_KEY_ERROR_MESSAGE } from "@/utils/constants";
import { ReactNode } from "react";

type ChatErrorTextComponentProps = {
  children: ReactNode;
};

const ChatErrorTextComponent = ({ children }: ChatErrorTextComponentProps) => {
  return <div className="text-red-500 mt-4 mb-2 text-center">{children}</div>;
};

type ChatErrorsProps = {
  errorMessage: string;
  charCount: number;
  mainStateDispatch: MainStateDispatch;
};

export const ChatErrors = ({
  errorMessage,
  charCount,
  mainStateDispatch,
}: ChatErrorsProps) => {
  if (errorMessage === MISSING_KEY_ERROR_MESSAGE) {
    return (
      <ChatErrorTextComponent>
        {MISSING_KEY_ERROR_MESSAGE}{" "}
        <span
          className="underline cursor-pointer"
          onClick={() => mainStateDispatch({ type: "TOGGLE_SETTINGS" })}
        >
          Check the settings for more info.
        </span>
      </ChatErrorTextComponent>
    );
  }

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
