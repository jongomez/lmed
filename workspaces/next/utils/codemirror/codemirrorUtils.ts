import {
  ChatMessage,
  ChatState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import {
  Completion,
  CompletionContext,
  CompletionResult,
  CompletionSource,
  closeCompletion,
} from "@/utils/codemirror/customAutocomplete/src";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { getMostRecentUserMessage } from "../chat/chatStateUtils";
import { sendPostRequestWithMultipleMessages } from "../chat/messageHandlingUtils";
import {
  PromptTemplate,
  applyPromptTemplate,
  defaultPromptTemplateMap,
} from "../chat/promptUtils";

/*

Autocomplete cases:
- The autocomplete tooltip can be triggered by the following:
  - Pressing Ctrl+Space
  - The backend OpenAI request has return a valid completion
  - NOTE: activateOnTyping⁠ was disabled. This means typing on the text editor WILL NOT trigger the autocomplete.
    - Maybe this can be an option on the settings?
case 1 - Currently fetching a new message, so just show a loading message in the autocomplete tooltip
case 2 - No valid completion. Will attempt to fetch a valid completion from the backend.
case 3 - We have a valid completion.

*/

// This function returns an array of CompletionSources. A CompletionSource is a function.
export const getCompletionSources = (
  lastLLMResponse: string,
  mainStateDispatch: MainStateDispatch,
  settings: MainState["settings"],
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>,
  chatState: ChatState
): readonly CompletionSource[] => {
  const completionSource = (
    context: CompletionContext
  ): CompletionResult | null => {
    // The current line text.
    const lineText = context.state.doc.lineAt(context.pos).text;
    const loadingCompletion: Completion = {
      label: "Loading...",
      // An empty apply function since selecting it should do nothing.
      apply: () => {},
    };

    const noCompletion: Completion = {
      label: "No completion available",
      // Selecting a "No completion available" completion will simple close the autocomplete tooltip.
      apply: (view) => {
        closeCompletion(view);
      },
    };

    // The "Loading..." and "No completion available" are not regular completions - they're just messages we show users.
    // So from and to can be really any number??? I think???
    const loadingCompletionResult: CompletionResult = {
      from: 0,
      to: 0,
      options: [loadingCompletion],
    };

    const noCompletionResult: CompletionResult = {
      from: 0,
      to: 0,
      options: [noCompletion],
    };

    //
    ////
    ////// Case 1: Currently fetching a new message, so just show a loading message in the autocomplete tooltip.
    if (chatState.isLoadingMessage) {
      return loadingCompletionResult;
    }

    debugger;
    //
    ////
    ////// Case 2: The currently selected line does not match lastLLMResponse, meaning there's no valid completion.
    console.log("lastLLMResponse", lastLLMResponse);
    debugger;
    // if (!lastLLMResponse.includes(lineText.trim())) {
    if (!lastLLMResponse) {
      const lineCompletionPrompt = applyPromptTemplate(
        fileEditorRef,
        defaultPromptTemplateMap.get("Line completion") as PromptTemplate
      );

      // If the previous message is exacly the same as the current message, tell the user there is no completion.
      if (getMostRecentUserMessage(chatState) === lineCompletionPrompt) {
        return noCompletionResult;
      }

      const newMessage: ChatMessage = {
        content: lineCompletionPrompt,
        role: "user",
      };

      // Add the prompt user message to the chat state.
      mainStateDispatch({
        type: "UPDATE_CHAT_STATE",
        payload: { newMessage },
      });

      // Currently only send 2 messages to the backend: the previous message and the new message.
      const messagesToSendToBackend: ChatMessage[] = [
        ...chatState.messages.slice(-1),
        newMessage,
      ];

      // If we're currently not in the process of fetching a completion, then fetch one.
      if (!chatState.isLoadingMessage) {
        sendPostRequestWithMultipleMessages(
          messagesToSendToBackend,
          mainStateDispatch,
          settings
        );
      }

      return loadingCompletionResult;
    }

TODO: Always perform a new fetch

    //
    ////
    ////// Case 3: We have a valid completion.
    const completion: Completion = {
      label: lastLLMResponse,
      apply: (view, completion, pos) => {
        // The apply function is called when a user selects a suggested completion.
        const lineFrom = view.state.doc.lineAt(pos).from;
        const lineTo = view.state.doc.lineAt(pos).to;

        // Delete the current line.
        view.dispatch({ changes: { from: lineFrom, to: lineTo } });

        // Insert lastLLMResponse at the start of the line.
        view.dispatch({ changes: { from: lineFrom, insert: lastLLMResponse } });

        // Set the cursor at the end of the line.
        const endOfLinePos = lineFrom + lastLLMResponse.length;
        view.dispatch({
          selection: {
            anchor: endOfLinePos,
            head: endOfLinePos,
          },
        });
      },
    };

    // Get the current line boundaries for the CompletionResult.
    const lineFrom = context.state.doc.lineAt(context.pos).from;
    // const lineTo = context.state.doc.lineAt(context.pos).to;

    // Setting from and to to lineFrom will do the following:
    // 1. The autocomplete tooltip will only show up at the start of the current line.
    // 2. No matching will be done on the current line. This means that the autocomplete tooltip will always show up.
    // 3. If no matching is ever done, the autocomplete tooltip will disappear as soon as the user types anything.
    // This is obviously not ideal. But for now it'll do.

    // Return a CompletionResult that spans the entire line.
    return {
      from: lineFrom,
      to: lineFrom,
      options: [completion],
    };
  };

  return [completionSource];
};
