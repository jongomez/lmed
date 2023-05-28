"use client";

import type { MainState, MainStateAction } from "@/types/MainTypes";
import { useSocket } from "@/utils/hooks";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useImmerReducer } from "use-immer";
import { Settings } from "./Settings.client";
// import { MainTabHeader } from "./Tabs.server";
import { FileAndPromptEditors } from "./FileAndPromptEditors.client";
import { MainHeader } from "./MainHeader.client";
import { MainMenu } from "./MainMenu.server";
import { MyTerminal } from "./Terminal.client";

export const MainContent = () => {
  // Socket is not part of the mainState because I was getting some immer type errors.
  const socket = useSocket();
  const [mainState, mainStateDispatch] = useImmerReducer<
    MainState,
    MainStateAction
  >(mainStateReducer, getInitialState());

  const activeMainTab = mainState.iconTabIndex;
  const isMainMenuOpen = mainState.isMainMenuOpen;

  return (
    // <div className={`h-screen w-screen grid ${tabGridClasses[activeMainTab]}`}>
    <div>
      <MainHeader
        activeMainTab={activeMainTab}
        isMainMenuOpen={isMainMenuOpen}
        mainStateDispatch={mainStateDispatch}
        fileEditorState={mainState.fileEditor}
      />

      {/* Main menu. This is a pop-up menu that will be accessible in all tabs. */}
      {isMainMenuOpen && (
        <MainMenu
          mainStateDispatch={mainStateDispatch}
          explorerState={mainState.explorer}
          fileEditorState={mainState.fileEditor}
        />
      )}

      {/* 1st tab - Will contain file editor, file explorer, and prompt editor. */}
      <FileAndPromptEditors
        mainState={mainState}
        mainStateDispatch={mainStateDispatch}
        activeTab={activeMainTab}
      />

      {/* 2nd tab - Will contain the file explorer and the file editor. */}
      {!!socket && <MyTerminal socket={socket} activeTab={activeMainTab} />}

      {/* 3rd tab - Will contain the file explorer and the file editor. */}
      <Settings
        fileEditorState={mainState.fileEditor}
        mainStateDispatch={mainStateDispatch}
        activeTab={activeMainTab}
      />

      {/* <Benchmarks className={}/> */}

      {/* <MainFooter
        fileEditorState={mainState.fileEditor}
        activeIndex={activeMainTab}
      /> */}
    </div>
  );
};
