"use client";

import type { EditorTab, FileNode, MainState, RootNode } from "@/types/Main";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { Benchmarks } from "./Benchmarks.client";
import { Editor } from "./Editor.client";
import { Settings } from "./Settings.client";
import { MyTerminal } from "./Terminal.client";

const getInitialState = (): MainState => {
  const explorerTreeRoot: RootNode = {
    id: 0,
    treeLength: 1,
    name: "root",
    type: "root",
    children: [],
  };

  const initialFile: FileNode = {
    id: 1,
    name: "New File",
    type: "file",
    selected: true,
    parentNode: explorerTreeRoot,
    fileHandle: null,
  };

  explorerTreeRoot.children.push(initialFile);

  const initialTab: EditorTab = {
    fileNode: initialFile,
    selected: true,
    name: "New File",
    value: ["", ""],
    language: "markdown",
    hasDiff: false,
    markers: {},
  };

  return {
    socket: undefined,
    tabIndex: 0,
    explorer: {
      explorerTreeRoot,
      selectedNode: initialFile,
      idCounter: 2,
    },
    editor: {
      currentTab: initialTab,
      allTabs: [initialTab],
      fontSize: 14,
      diffEditorRef: null,
      theme: "github-dark",
    },
  };
};

export const Main = () => {
  const [mainState, setMainState] = useState<MainState>(getInitialState());

  useEffect(() => {
    const socket = io(`http://localhost:${WEBSOCKET_SERVER_PORT}`);
    setMainState((prevState: MainState) => ({ ...prevState, socket }));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {/* <Explorer
        explorerState={mainState.explorer}
        setMainState={setMainState}
      /> */}

      <div>
        <Editor editorState={mainState.editor} setMainState={setMainState} />
      </div>
      <div>
        {!!mainState.socket && <MyTerminal socket={mainState.socket} />}
      </div>
      <div>
        <Settings editorState={mainState.editor} setMainState={setMainState} />
      </div>
      <div>
        <Benchmarks />
      </div>
    </>
  );
};
