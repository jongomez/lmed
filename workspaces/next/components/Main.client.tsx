"use client";

import type { EditorTab, ExplorerNode, MainState } from "@/types/Main";
import { Box, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import "react-tabs/style/react-tabs.css";
import { io } from "socket.io-client";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { Benchmarks } from "./Benchmarks.client";
import { Editor } from "./Editor.client";
import { Explorer } from "./Explorer.client";
import { Settings } from "./Settings.client";
import { TabPanel, tabProps } from "./TabHelpers.client";
import { MyTerminal } from "./Terminal.client";

const getInitialState = (): MainState => {
  const initialFile: ExplorerNode = {
    id: 1,
    name: "New File",
    type: "file",
    selected: true,
    expanded: false,
  };

  const initialTab: EditorTab = {
    file: initialFile,
    selected: true,
    name: "New File",
    value: [""],
    mode: "text",
    hasDiff: false,
    markers: {},
  };

  return {
    socket: undefined,
    tabIndex: 0,
    explorer: {
      explorerTreeRoot: {
        id: 0,
        name: "root",
        type: "root",
        selected: false,
        expanded: false,
        // Add an initial child to the root node.
        children: [initialFile],
      },
      selectedNode: initialFile,
      idCounter: 2,
    },
    editor: {
      currentTab: initialTab,
      allTabs: [initialTab],
      fontSize: 14,
      diffEditorRef: null,
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
      <Explorer />

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={mainState.tabIndex}
          onChange={(event, newValue) => {
            setMainState((prevState) => ({ ...prevState, tabIndex: newValue }));
          }}
          aria-label="main tabs"
        >
          <Tab label="Item One" {...tabProps(0)} />
          <Tab label="Item Two" {...tabProps(1)} />
          <Tab label="Item Three" {...tabProps(2)} />
        </Tabs>
      </Box>

      <TabPanel value={mainState.tabIndex} index={0}>
        <Editor />
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
