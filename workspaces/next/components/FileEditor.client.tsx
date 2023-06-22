"use client";

import CodeMirror from "@uiw/react-codemirror";
import { MutableRefObject, useCallback, useEffect } from "react";

import { ChatState, MainState, MainStateDispatch } from "@/types/MainTypes";
import {
  PromptTemplate,
  PromptTemplateMap,
  applyPromptTemplate,
  getCurrentlySelectedPrompt,
} from "@/utils/chat/promptUtils";
import { inlineSuggestion } from "@/utils/codemirror/customInlineSuggestion/src";
import { customKeymap } from "@/utils/codemirror/customKeymap/src";
import { getEditorLanguageFromState } from "@/utils/editorUtils";
import {
  SwitchToNewFileAnnotation,
  getCurrentlySelectedFile,
} from "@/utils/fileUtils";
import { EditorState } from "@codemirror/state";
import { ViewUpdate } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

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
  settings: MainState["settings"];
  mainStateDispatch: MainStateDispatch;
  explorerNodeMap: MainState["explorerNodeMap"];
  promptTemplateMap: PromptTemplateMap;
  className: string;
  isFileEditorActive: boolean;
  lastLLMResponse: string;
  chatState: ChatState;
  keyboardShortcuts: MainState["settings"]["keyboardShortcuts"];
};

export const FileEditor = ({
  fileEditorRef,
  settings,
  mainStateDispatch,
  explorerNodeMap,
  promptTemplateMap,
  className,
  isFileEditorActive,
  lastLLMResponse,
  chatState,
  keyboardShortcuts,
}: FileEditorProps) => {
  const selectedFile = getCurrentlySelectedFile(explorerNodeMap);
  const selectedPrompt = getCurrentlySelectedPrompt(promptTemplateMap);
  // const LLMResponseCode = extractCodeBlocksFromMarkdown(lastLLMResponse)?.[0];

  // Gotta use a ref callback:
  // https://github.com/uiwjs/react-codemirror/issues/314
  function refCallack(editor: ReactCodeMirrorRef) {
    if (
      !fileEditorRef.current?.editor &&
      editor?.editor &&
      editor?.state &&
      editor?.view
    ) {
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

      // console.log("onChange value:", value);
      // console.log("onChange viewUpdate annotation:", annotation);

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

  const fetchCallback = useCallback(
    (editorState: EditorState) => {
      // return fetchInlineSuggestion(
      //   mainStateDispatch,
      //   fileEditorRef,
      //   defaultPromptTemplateMap,
      //   chatState,
      //   settings
      // );

      return Promise.resolve("Testing testing");
    },
    [mainStateDispatch, fileEditorRef, chatState, settings]
  );

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
        theme={getEditorThemeFromState(settings.editorSettings)}
        // theme={githubDark}
        extensions={[
          ...(settings.editorSettings.keyBindings === "vim" ? [vim()] : []),
          getEditorLanguageFromState(explorerNodeMap),
          inlineSuggestion({
            fetchFn: fetchCallback,
            mode: "manual",
          }),
          customKeymap(keyboardShortcuts),
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
        // basicSetup={{
        //   // Old approach - Turn off the default autocompletion plugin, as we're using our own.
        //   // autocompletion: false,
        // }}
      />
    </div>
  );
};
