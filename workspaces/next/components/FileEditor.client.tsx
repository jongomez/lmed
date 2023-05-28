"use client";

import CodeMirror from "@uiw/react-codemirror";
import { useCallback, useEffect, useRef } from "react";

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
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

type FileEditorProps = {
  fileEditorState: FileEditorState;
  globalEditorSettings: GlobalEditorSettings;
  mainStateDispatch: MainStateDispatch;
  explorerState: ExplorerState;
  className: string;
};

export const FileEditor = ({
  fileEditorState,
  globalEditorSettings,
  mainStateDispatch,
  explorerState,
  className,
}: FileEditorProps) => {
  const codeMirrorRef = useRef<ReactCodeMirrorRef>();

  useEffect(() => {
    const editor = codeMirrorRef.current?.editor;

    if (!editor) return;

    // editor.setSize("100%", "100%");
  }, [codeMirrorRef]);

  // TODO: serialize editor state and store it in localStorage?
  //  https://github.com/uiwjs/react-codemirror#use-initialstate-to-restore-state-from-json-serialized-representation
  const onChange = useCallback((value: string) => {
    console.log("value:", value);
    // setMainState((prevState) => ({ ...prevState, value }));
  }, []);

  return (
    <div className={`${className} overflow-auto`}>
      <CodeMirror
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(globalEditorSettings)}
        extensions={[getEditorLanguageFromState(fileEditorState)]}
        onChange={onChange}
        // ref={}
        // Both style={{ height: "100%" }} and height="100%" are necessary.
        style={{ height: "100%" }}
        height="100%"
        width="100%"
      />
    </div>
  );
};
