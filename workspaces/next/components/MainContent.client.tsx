"use client";

import type { MainState, MainStateAction } from "@/types/MainTypes";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useImmerReducer } from "use-immer";
import { WEBSOCKET_SERVER_PORT } from "../../../shared/constants";
import { Editor } from "./Editor.client";
import { Explorer } from "./Explorer.client";
import { MainFooter } from "./Footer.server";
import { Settings } from "./Settings.client";
import { MainTabHeader } from "./Tabs.server";
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

  const explorerVisibility = activeMainTab === 0 ? "" : "hidden";
  const editorVisibility = activeMainTab === 0 ? "" : "hidden";
  const terminalVisibility = activeMainTab === 1 ? "" : "hidden";
  const settingsVisibility = activeMainTab === 2 ? "" : "hidden";

  return (
    <div
      className={`h-screen w-screen grid grid-cols-12 grid-rows-[42px_auto_24px]`}
    >
      <MainTabHeader
        tabs={["Editor", "Terminal", "Settings"]}
        onTabClick={(tab: number) => {
          mainStateDispatch({ type: "SET_MAIN_TAB", payload: tab });
        }}
        activeIndex={activeMainTab}
      />

      <Explorer
        explorerState={mainState.explorer}
        editorState={mainState.editor}
        mainStateDispatch={mainStateDispatch}
        parentNode={mainState.explorer.explorerTreeRoot}
        className={`col-span-4 row-start-2 ${explorerVisibility}`}
      />
      <Editor
        editorState={mainState.editor}
        mainStateDispatch={mainStateDispatch}
        explorerState={mainState.explorer}
        className={`col-span-8 row-start-2 ${editorVisibility}`}
      />

      {!!socket && (
        <MyTerminal
          socket={socket}
          className={`col-span-full ${terminalVisibility}`}
        />
      )}

      <Settings
        editorState={mainState.editor}
        mainStateDispatch={mainStateDispatch}
        className={`col-span-full ${settingsVisibility}`}
      />

      {/* <Benchmarks className={}/> */}

      <MainFooter editorState={mainState.editor} activeIndex={activeMainTab} />
    </div>
  );
};
