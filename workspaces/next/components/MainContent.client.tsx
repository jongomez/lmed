"use client";

import type { MainState, MainStateAction } from "@/types/MainTypes";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useImmerReducer } from "use-immer";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { Benchmarks } from "./Benchmarks.client";
import { Editor } from "./Editor.client";
import { Explorer } from "./Explorer.client";
import { MainFooter } from "./Footer.server";
import { Settings } from "./Settings.client";
import { MainTabHeader, MainTabPanel } from "./Tabs.server";
import { MyTerminal } from "./Terminal.client";

export const MainContent = () => {
  // Socket is not part of the mainState because I was getting some immer type errors.
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mainState, mainStateDispatch] = useImmerReducer<
    MainState,
    MainStateAction
  >(mainStateReducer, getInitialState());

  const activeMainTab = mainState.mainTab;

  useEffect(() => {
    // Connect to the websocket server.
    const ioSocket = io(`http://localhost:${WEBSOCKET_SERVER_PORT}`);
    setSocket(ioSocket);

    return () => {
      ioSocket.disconnect();
    };
  }, []);

  return (
    <div className={`flex flex-col h-screen w-screen`}>
      <MainTabHeader
        tabs={["Editor", "Terminal", "Settings", "Benchmarks"]}
        onTabClick={(tab: number) => {
          mainStateDispatch({ type: "SET_MAIN_TAB", payload: tab });
        }}
        activeIndex={activeMainTab}
      />

      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={0}>
        <div className="grid grid-cols-12 w-screen h-full">
          <div className="flex flex-col justify-between flex-grow-0 flex-shrink-0 col-span-4">
            <Explorer
              explorerState={mainState.explorer}
              editorState={mainState.editor}
              mainStateDispatch={mainStateDispatch}
              parentNode={mainState.explorer.explorerTreeRoot}
            />
          </div>
          <div className="w-full col-span-8">
            <Editor
              editorState={mainState.editor}
              mainStateDispatch={mainStateDispatch}
              explorerState={mainState.explorer}
            />
          </div>
        </div>
      </MainTabPanel>
      <MainTabPanel activeIndex={activeMainTab} tabPanelIndex={1}>
        {!!socket && <MyTerminal socket={socket} />}
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
    </div>
  );
};
