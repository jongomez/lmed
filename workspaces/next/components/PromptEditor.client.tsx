"use client";

import CodeMirror from "@uiw/react-codemirror";
import { useCallback } from "react";

import {
  ExplorerState,
  FileEditorState,
  GlobalEditorSettings,
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

  const editorProps = {
    height: "100%",
    width: "100%",
  };

  // TODO: serialize editor state and store it in localStorage?
  //  https://github.com/uiwjs/react-codemirror#use-initialstate-to-restore-state-from-json-serialized-representation
  const onChange = useCallback((value: string) => {
    console.log("value:", value);
    // setMainState((prevState) => ({ ...prevState, value }));
  }, []);

  return (
    <div className={className}>
      <CodeMirror
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(globalEditorSettings)}
        extensions={[getEditorLanguageFromState(fileEditorState)]}
        onChange={onChange}
        {...editorProps}
      />
    </div>
  );
};
