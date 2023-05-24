"use client";

import CodeMirror from "@uiw/react-codemirror";
import { useCallback } from "react";

import {
  EditorState,
  EditorTab,
  ExplorerState,
  MainStateDispatch,
} from "@/types/MainTypes";
import {
  getEditorLanguageFromState,
  getEditorThemeFromState,
} from "@/utils/editorUtils";

type EditorTabsProps = {
  editorState: EditorState;
  mainStateDispatch: MainStateDispatch;
  explorerState: ExplorerState;
};

const EditorTabs = ({
  editorState,
  mainStateDispatch,
  explorerState,
}: EditorTabsProps) => {
  const handleTabClick = (tab: EditorTab) => {
    // dispatch an action to set the current tab to the tab that was clicked
    mainStateDispatch({
      type: "SET_CURRENT_TAB",
      payload: tab,
    });
  };

  return (
    <div className="h-10 flex">
      {editorState.allTabs.map((tab, index) => (
        <div
          key={index}
          className={`h-10 ${editorState.currentTab === tab ? "active" : ""}`}
          onClick={() => handleTabClick(tab)}
        >
          {tab.fileNode.name}
        </div>
      ))}
    </div>
  );
};

type EditorProps = {
  editorState: EditorState;
  mainStateDispatch: MainStateDispatch;
  explorerState: ExplorerState;
};

export const Editor = ({
  editorState,
  mainStateDispatch,
  explorerState,
}: EditorProps) => {
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
    <div className="w-full">
      <EditorTabs {...{ editorState, mainStateDispatch, explorerState }} />
      <CodeMirror
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(editorState)}
        extensions={[getEditorLanguageFromState(editorState)]}
        onChange={onChange}
        {...editorProps}
      />
    </div>
  );
};
