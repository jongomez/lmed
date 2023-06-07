"use client";

import CodeMirror from "@uiw/react-codemirror";
import { MutableRefObject, useCallback, useEffect } from "react";

import {
  GlobalEditorSettings,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
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
import { ViewUpdate } from "@codemirror/view";
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
  globalEditorSettings: GlobalEditorSettings;
  mainStateDispatch: MainStateDispatch;
  explorerNodeMap: MainState["explorerNodeMap"];
  promptTemplateMap: PromptTemplateMap;
  className: string;
};

export const FileEditor = ({
  fileEditorRef,
  globalEditorSettings,
  mainStateDispatch,
  explorerNodeMap,
  promptTemplateMap,
  className,
}: FileEditorProps) => {
  const selectedFile = getCurrentlySelectedFile(explorerNodeMap);
  const selectedPrompt = getCurrentlySelectedPrompt(promptTemplateMap);

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

      console.log("value:", value);
      console.log("annotation:", annotation);

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
    [
      mainStateDispatch,
      // fileEditorRef,
      // promptEditorRef,
      // selectedPrompt,
      selectedFile,
    ]
  );

  useEffect(() => {
    // When the prompt editor ref is set, set the initial prompt editor value.

    setPromptSuggestion(fileEditorRef, selectedPrompt, mainStateDispatch);
  }, [mainStateDispatch, fileEditorRef, selectedPrompt]);

  return (
    <div className={`${className} overflow-auto`}>
      <CodeMirror
        ref={refCallack}
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(globalEditorSettings)}
        extensions={[getEditorLanguageFromState(explorerNodeMap)]}
        onChange={onChange}
        onUpdate={(viewUpdate: ViewUpdate) => {
          if (!viewUpdate.selectionSet && !viewUpdate.docChanged) {
            return;
          }

          // debugger;

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
      />
    </div>
  );
};
