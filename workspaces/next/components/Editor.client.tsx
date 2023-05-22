"use client";

import CodeMirror from "@uiw/react-codemirror";
import { useCallback } from "react";

import { EditorState, SetMainState } from "@/types/Main";
import {
  getEditorLanguageFromState,
  getEditorThemeFromState,
} from "@/utils/editorUtils";
import { P } from "./base/Typography.server";

type EditorProps = {
  editorState: EditorState;
  setMainState: SetMainState;
};

export const Editor = ({ editorState, setMainState }: EditorProps) => {
  // https://github.com/securingsincity/react-ace/issues/27
  // https://github.com/JedWatson/react-codemirror/issues/77
  // useEffect(() => {}, []);

  const editorProps = {
    height: "100%",
    width: "100%",
  };

  // TODO: serialize editor state and store it in localStorage?
  //  https://github.com/uiwjs/react-codemirror#use-initialstate-to-restore-state-from-json-serialized-representation
  const onChange = useCallback(
    (value: string) => {
      console.log("value:", value);
      setMainState((prevState) => ({ ...prevState, value }));
    },
    [setMainState]
  );

  return (
    <div>
      <CodeMirror
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(editorState)}
        extensions={[getEditorLanguageFromState(editorState)]}
        onChange={onChange}
        {...editorProps}
      />

      <P>Editor mode: {editorState.currentTab.language}</P>
    </div>
  );
};
