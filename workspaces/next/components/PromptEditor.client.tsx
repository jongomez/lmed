"use client";

import CodeMirror, { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject, useCallback } from "react";

import {
  FileEditorState,
  GlobalEditorSettings,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import {
  getEditorLanguageFromState,
  getEditorThemeFromState,
} from "@/utils/editorUtils";

type PromptEditorProps = {
  fileEditorState: FileEditorState;
  globalEditorSettings: GlobalEditorSettings;
  mainStateDispatch: MainStateDispatch;
  explorerNodeMap: MainState["explorerNodeMap"];
  promptEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  className: string;
};

export const PromptEditor = ({
  fileEditorState,
  globalEditorSettings,
  mainStateDispatch,
  explorerNodeMap,
  promptEditorRef,
  className,
}: PromptEditorProps) => {
  // https://github.com/securingsincity/react-ace/issues/27
  // https://github.com/JedWatson/react-codemirror/issues/77
  // useEffect(() => {}, []);

  // TODO: serialize editor state and store it in localStorage?
  //  https://github.com/uiwjs/react-codemirror#use-initialstate-to-restore-state-from-json-serialized-representation
  const onChange = useCallback((value: string) => {
    console.log("value:", value);
    // setMainState((prevState) => ({ ...prevState, value }));
  }, []);

  // Gotta use a ref callback:
  // https://github.com/uiwjs/react-codemirror/issues/314
  function refCallack(editor: ReactCodeMirrorRef) {
    if (
      !promptEditorRef.current?.editor &&
      editor?.editor &&
      editor?.state &&
      editor?.view
    ) {
      console.log("\n\nPrompt editor:", editor);
      // WARNING: This is a mutation. Refs are mutable.
      promptEditorRef.current = editor;
      mainStateDispatch({
        type: "PROMPT_EDITOR_REF_SET",
        payload: true,
      });
    }
  }

  return (
    <div className={`${className} overflow-auto`}>
      <CodeMirror
        ref={refCallack}
        value="loading..."
        theme={getEditorThemeFromState(globalEditorSettings)}
        extensions={[getEditorLanguageFromState(explorerNodeMap)]}
        onChange={onChange}
        // Both style={{ height: "100%" }} and height="100%" are necessary.
        style={{ height: "100%" }}
        height="100%"
        width="100%"
      />
    </div>
  );
};
