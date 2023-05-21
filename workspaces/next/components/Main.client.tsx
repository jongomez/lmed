"use client";

import type { EditorTab, FileNode, MainState, RootNode } from "@/types/Main";
import { Box, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { Benchmarks } from "./Benchmarks.client";
import { Editor } from "./Editor.client";
import { Explorer } from "./Explorer.client";
import { Settings } from "./Settings.client";
import { TabPanel, tabProps } from "./TabHelpers.client";
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
      <Explorer
        explorerState={mainState.explorer}
        setMainState={setMainState}
      />

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={mainState.tabIndex}
          onChange={(event, newValue) => {
            setMainState((prevState) => ({ ...prevState, tabIndex: newValue }));
          }}
          aria-label="main tabs"
        >
          <Tab label="Editor" {...tabProps(0)} />
          <Tab label="Terminal" {...tabProps(1)} />
          <Tab label="Settings" {...tabProps(2)} />
          <Tab label="Benchmarks" {...tabProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={mainState.tabIndex} index={0}>
        <Editor editorState={mainState.editor} setMainState={setMainState} />
      </TabPanel>
      <TabPanel value={mainState.tabIndex} index={1}>
        {!!mainState.socket && <MyTerminal socket={mainState.socket} />}
      </TabPanel>
      <TabPanel value={mainState.tabIndex} index={2}>
        <Settings />
      </TabPanel>
      <TabPanel value={mainState.tabIndex} index={3}>
        <Benchmarks />
      </TabPanel>
    </>
  );
};
