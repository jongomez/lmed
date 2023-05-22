"use client";

import type { EditorTab, FileNode, MainState, RootNode } from "@/types/Main";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { Benchmarks } from "./Benchmarks.client";
import { Editor } from "./Editor.client";
import { Explorer } from "./Explorer.client";
import { Settings } from "./Settings.client";
import { MyTerminal } from "./Terminal.client";
import { MainTabHeader, MainTabPanel } from "./base/Tabs.server";

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
    mainTab: 0,
  };
};

export const Main = () => {
  const [mainState, setMainState] = useState<MainState>(getInitialState());
  const activeMainTab: number = mainState.mainTab;

  useEffect(() => {
    // Connect to the websocket server.
    const socket = io(`http://localhost:${WEBSOCKET_SERVER_PORT}`);
    setMainState((prevState: MainState) => ({ ...prevState, socket }));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <MainTabHeader
        tabs={["Editor", "Terminal", "Settings", "Benchmarks"]}
        onTabClick={(tab: number) => {
          setMainState((prevState) => ({ ...prevState, mainTab: tab }));
        }}
        activeIndex={activeMainTab}
      />

      <MainTabPanel
        activeIndex={activeMainTab}
        tabPanelIndex={0}
        className="flex"
      >
        <Explorer
          explorerState={mainState.explorer}
          setMainState={setMainState}
          parentNode={mainState.explorer.explorerTreeRoot}
        />
        <Editor editorState={mainState.editor} setMainState={setMainState} />
      </MainTabPanel>
      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={1}>
        {!!mainState.socket && <MyTerminal socket={mainState.socket} />}
      </MainTabPanel>
      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={2}>
        <Settings editorState={mainState.editor} setMainState={setMainState} />
      </MainTabPanel>
      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={3}>
        <Benchmarks />
      </MainTabPanel>
    </>
  );
};
