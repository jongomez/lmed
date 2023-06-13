import { ChatHookState, ChatMessage } from "@/types/MainTypes";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

const dummyMessages: ChatMessage[] = [
  { role: "assistant", content: "Hey, how's it going?" },
];

export type ChatHookReturnType = {
  chatState: ChatHookState;
  setChatState: Dispatch<SetStateAction<ChatHookState>>;
  textAreaRef: RefObject<HTMLTextAreaElement>;
  messagesContainerRef: RefObject<HTMLDivElement>;
  appendBotMessage: (botMessage: ChatMessage) => void;
  appendUserMessage: (userMessage: string) => ChatMessage[];
};

export const useChat = (promptSuggestion: string): ChatHookReturnType => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [chatState, setChatState] = useState<ChatHookState>({
    charCount: 0,
    errorMessage: "",
    messages: dummyMessages,
    isLoadingMessage: false,
  });

  // The following useEffect is used to scroll to the bottom of the text area.
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.value = promptSuggestion;
      textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight;
    }
  }, [textAreaRef, promptSuggestion]);

  // Appends message from the bot to the messages state array. This will update the chat's text area.
  // If the message already exists, it updates the existing message.
  const appendBotMessage = (botMessage: ChatMessage) => {
    setChatState((currentState) => {
      if (currentState.messages.length === 0) {
        const errorMessage =
          "Unknown error: messages array is empty. There should be at least 1 user message.";
        console.error(errorMessage);
        return { ...currentState, errorMessage };
      }

      const lastMessageRole = currentState.messages.at(-1)?.role;

      if (lastMessageRole === "assistant") {
        // Update existing message.
        const updatedMessages = [...currentState.messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...updatedMessages[updatedMessages.length - 1],
          content: botMessage.content,
        };

        return { ...currentState, messages: updatedMessages };
      } else if (lastMessageRole === "user") {
        // Create new message.
        const messagesWithNewBotMessage: ChatMessage[] = [
          ...currentState.messages,
          botMessage,
        ];

        // NOTE: Besides creating a new message, also clear any error messages.
        return {
          ...currentState,
          errorMessage: "",
          messages: messagesWithNewBotMessage,
        };
      } else {
        const errorMessage =
          "Unknown error: last message is neither from the user nor the bot.";
        console.error(errorMessage);
        return { ...currentState, errorMessage };
      }
    });
  };

  // Appends message from the user to the messages array. This will update the chat's scroll view.
  const appendUserMessage = (userMessage: string): ChatMessage[] => {
    // NOTE: status is always "complete" for user messages.
    const newMessage: ChatMessage = {
      role: "user",
      content: userMessage,
    };

    const allMessages: ChatMessage[] = [...chatState.messages, newMessage];

    setChatState((currentState) => ({
      ...currentState,
      messages: allMessages,
    }));

    return allMessages;
  };

  return {
    chatState,
    setChatState,
    textAreaRef,
    messagesContainerRef,
    appendBotMessage,
    appendUserMessage,
  };
};
