"use client";

import type { MainState, MainStateAction } from "@/types/MainTypes";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useImmerReducer } from "use-immer";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { Benchmarks } from "./Benchmarks.client";
import { Editor } from "./Editor.client";
import { Explorer } from "./Explorer.client";
import { MainFooter } from "./Footer.server";
import { Settings } from "./Settings.client";
import { MainTabHeader, MainTabPanel } from "./Tabs.server";
import { MyTerminal } from "./Terminal.client";

export const Main = () => {
  const [mainState, mainStateDispatch] = useImmerReducer<
    MainState,
    MainStateAction
  >(mainStateReducer, getInitialState());

  const activeMainTab = mainState.mainTab;

  useEffect(() => {
    // Connect to the websocket server.
    const socket = io(`http://localhost:${WEBSOCKET_SERVER_PORT}`);
    mainStateDispatch({ type: "SET_SOCKET", payload: socket });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <MainTabHeader
        tabs={["Editor", "Terminal", "Settings", "Benchmarks"]}
        onTabClick={(tab: number) => {
          mainStateDispatch({ type: "SET_MAIN_TAB", payload: tab });
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
          editorState={mainState.editor}
          mainStateDispatch={mainStateDispatch}
          parentNode={mainState.explorer.explorerTreeRoot}
        />
        <Editor
          editorState={mainState.editor}
          mainStateDispatch={mainStateDispatch}
          explorerState={mainState.explorer}
        />
      </MainTabPanel>
      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={1}>
        {!!mainState.socket && <MyTerminal socket={mainState.socket} />}
      </MainTabPanel>
      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={2}>
        <Settings
          editorState={mainState.editor}
          mainStateDispatch={mainStateDispatch}
        />
      </MainTabPanel>
      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={3}>
        <Benchmarks />
      </MainTabPanel>

      <MainFooter editorState={mainState.editor} activeIndex={activeMainTab} />
    </>
  );
};
