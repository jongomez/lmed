"use client";

import CodeMirror from "@uiw/react-codemirror";
import { MutableRefObject, useCallback, useEffect } from "react";

import {
  GlobalEditorSettings,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import {
  Completion,
  CompletionContext,
  CompletionResult,
  CompletionSource,
  customAutocompletion,
  startCompletion,
} from "@/utils/codemirror/customAutocomplete/src";
import {
  getEditorLanguageFromState,
  getEditorThemeFromState,
} from "@/utils/editorUtils";
import {
  SwitchToNewFileAnnotation,
  getCurrentlySelectedFile,
} from "@/utils/fileUtils";
import {
  PromptTemplate,
  PromptTemplateMap,
  applyPromptTemplate,
  getCurrentlySelectedPrompt,
} from "@/utils/promptUtils";

import { extractCodeFromLLMResponse } from "@/utils/LLMResponseUtils";
import { ViewUpdate } from "@codemirror/view";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

// This function returns an array of CompletionSources. A CompletionSource is a function.
const getCompletionSources = (
  lastLLMResponse: string
): readonly CompletionSource[] => {
  const completionSource = (
    context: CompletionContext
  ): CompletionResult | null => {
    // The current line text.
    const lineText = context.state.doc.lineAt(context.pos).text;

    // Construct a completion that replaces the current line with lastLLMResponse.
    const completion: Completion = {
      label: lastLLMResponse,
      apply: (view, completion, pos) => {
        // Get the current line boundaries.
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

    // Only suggest the completion if the entire line text is a substring of the completion label.
    // (this is not currently used, but could come in handy in the future)
    // if (!completion.label.includes(lineText.trim())) {
    //   return null;
    // }

    // Get the current line boundaries for the CompletionResult.
    const lineFrom = context.state.doc.lineAt(context.pos).from;
    const lineTo = context.state.doc.lineAt(context.pos).to;

    // Return a CompletionResult that spans the entire line.
    return {
      from: lineFrom,
      to: lineTo,
      options: [completion],
    };
  };

  return [completionSource];
};

const setPromptSuggestion = (
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>,
  selectedPrompt: PromptTemplate,
  mainStateDispatch: MainStateDispatch
): void => {
  const newPrompt = applyPromptTemplate(fileEditorRef, selectedPrompt);
  mainStateDispatch({
    type: "SET_CHAT_PROMPT_SUGGESTION",
    payload: newPrompt,
  });
};

type FileEditorProps = {
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  globalEditorSettings: GlobalEditorSettings;
  mainStateDispatch: MainStateDispatch;
  explorerNodeMap: MainState["explorerNodeMap"];
  promptTemplateMap: PromptTemplateMap;
  className: string;
  isFileEditorActive: boolean;
  lastLLMResponse: string;
};

export const FileEditor = ({
  fileEditorRef,
  globalEditorSettings,
  mainStateDispatch,
  explorerNodeMap,
  promptTemplateMap,
  className,
  isFileEditorActive,
  lastLLMResponse,
}: FileEditorProps) => {
  const selectedFile = getCurrentlySelectedFile(explorerNodeMap);
  const selectedPrompt = getCurrentlySelectedPrompt(promptTemplateMap);
  const LLMResponseCode = extractCodeFromLLMResponse(lastLLMResponse);

  // Gotta use a ref callback:
  // https://github.com/uiwjs/react-codemirror/issues/314
  function refCallack(editor: ReactCodeMirrorRef) {
    if (
      !fileEditorRef.current?.editor &&
      editor?.editor &&
      editor?.state &&
      editor?.view
    ) {
      console.log("\n\neditor:", editor);
      // WARNING: This is a mutation. Refs are mutable.
      fileEditorRef.current = editor;
      setPromptSuggestion(fileEditorRef, selectedPrompt, mainStateDispatch);
    }
  }

  // TODO: serialize editor state and store it in localStorage?
  //  https://github.com/uiwjs/react-codemirror#use-initialstate-to-restore-state-from-json-serialized-representation
  const onChange = useCallback(
    (value: string, viewUpdate: ViewUpdate) => {
      const annotation = viewUpdate.transactions[0]?.annotation(
        SwitchToNewFileAnnotation
      );

      // startCompletion(viewUpdate.view);

      console.log("onChange value:", value);
      console.log("onChange viewUpdate annotation:", annotation);

      // updatePromptEditor(promptEditorRef, fileEditorRef, selectedPrompt);

      if (annotation === "FIRST_TIME_OPENING_FILE") {
        return;
      }

      if (!selectedFile.isDirty) {
        // Set the file as dirty.
        mainStateDispatch({
          type: "UPDATE_FILE_IS_DIRTY",
          payload: { fileNode: selectedFile, isDirty: true },
        });
      }
    },
    [mainStateDispatch, selectedFile]
  );

  useEffect(() => {
    // When the file editor ref is set and ready, we can start handling the prompt suggestions. This is
    // because the prompt templates take into account text from the editor. Meaning: no editor, no prompt.
    if (fileEditorRef.current?.view) {
      setPromptSuggestion(fileEditorRef, selectedPrompt, mainStateDispatch);
    }
  }, [mainStateDispatch, fileEditorRef, selectedPrompt]);

  useEffect(() => {
    // Every time there's new LLM response code, we'll automatically show the completion tooltip.
    if (fileEditorRef.current?.view) {
      startCompletion(fileEditorRef.current.view);
      fileEditorRef.current.view.focus();
    }
  }, [LLMResponseCode, fileEditorRef]);

  return (
    <div
      className={`
        ${className} 
        ${isFileEditorActive ? "" : "hidden"} 
        overflow-auto
      `}
    >
      <CodeMirror
        ref={refCallack}
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(globalEditorSettings)}
        extensions={[
          getEditorLanguageFromState(explorerNodeMap),
          customAutocompletion({
            override: getCompletionSources(LLMResponseCode),
          }),
        ]}
        onChange={onChange}
        onUpdate={(viewUpdate: ViewUpdate) => {
          if (!viewUpdate.selectionSet && !viewUpdate.docChanged) {
            return;
          }

          if (fileEditorRef.current?.view) {
            setPromptSuggestion(
              fileEditorRef,
              selectedPrompt,
              mainStateDispatch
            );
          }
        }}
        // Both style={{ height: "100%" }} and height="100%" are necessary.
        style={{ height: "100%" }}
        height="100%"
        width="100%"
        basicSetup={{
          // Turn off the default autocompletion plugin, as we're using our own.
          autocompletion: false,
        }}
      />
    </div>
  );
};
