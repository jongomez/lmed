"use client";

import CodeMirror from "@uiw/react-codemirror";
import { useCallback } from "react";

import {
  ExplorerState,
  FileEditorState,
  GlobalEditorSettings,
  MainStateDispatch,
} from "@/types/MainTypes";
import { PROMPT_EDITOR_ID } from "@/utils/constants";
import {
  getEditorLanguageFromState,
  getEditorThemeFromState,
} from "@/utils/editorUtils";

type PromptEditorProps = {
  fileEditorState: FileEditorState;
  globalEditorSettings: GlobalEditorSettings;
  mainStateDispatch: MainStateDispatch;
  explorerState: ExplorerState;
  className: string;
};

export const PromptEditor = ({
  fileEditorState,
  globalEditorSettings,
  mainStateDispatch,
  explorerState,
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

  return (
    <div className={className} id={PROMPT_EDITOR_ID}>
      <CodeMirror
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(globalEditorSettings)}
        extensions={[getEditorLanguageFromState(fileEditorState)]}
        onChange={onChange}
        // Both style={{ height: "100%" }} and height="100%" are necessary.
        style={{ height: "100%" }}
        height="100%"
        width="100%"
      />
    </div>
  );
};
