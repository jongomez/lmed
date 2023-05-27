"use client";

import type { MainState, MainStateAction } from "@/types/MainTypes";
import { useSocket } from "@/utils/hooks";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useImmerReducer } from "use-immer";
import { Explorer } from "./Explorer.client";
import { MainFooter } from "./Footer.server";
import { Settings } from "./Settings.client";
// import { MainTabHeader } from "./Tabs.server";
import { FileEditor } from "./FileEditor.client";
import { MainMenu } from "./MainMenu";
import { PromptEditor } from "./PromptEditor.client";
import { FileEditorTabs, MainTabs, PromptTabs } from "./Tabs.server";
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

  const explorerVisibility = activeMainTab === 0 ? "" : "hidden";
  const editorVisibility = activeMainTab === 0 ? "" : "hidden";
  const promptEditorVisibility = activeMainTab === 0 ? "" : "hidden";
  const terminalVisibility = activeMainTab === 1 ? "" : "hidden";
  const settingsVisibility = activeMainTab === 2 ? "" : "hidden";

  // 42px is the height of the tab headers. 24px is the height of the footer.
  const tabGridClasses = [
    "grid-rows-[42px_7fr_42px_3fr_24px] grid-cols-[minmax(150px,_250px)_1fr]",
    "grid-rows-[42px_3fr_8fr]",
    "grid-rows-[42px_auto]",
  ];

  return (
    <div className={`h-screen w-screen grid ${tabGridClasses[activeMainTab]}`}>
      {/* Tabs that show at the top of the screen: */}
      <div
        className="col-span-full row-span-1 flex z-30
      border-b-2 border-innactive-colors bg-white dark:bg-slate-800"
      >
        <MainTabs
          activeIndex={activeMainTab}
          mainStateDispatch={mainStateDispatch}
          isMainMenuOpen={isMainMenuOpen}
        />
        <FileEditorTabs
          fileEditorState={mainState.fileEditor}
          mainStateDispatch={mainStateDispatch}
        />
      </div>

      {/* Main menu. This is a pop-up menu that will be accessible in all tabs. */}
      {isMainMenuOpen && (
        <MainMenu
          mainStateDispatch={mainStateDispatch}
          explorerState={mainState.explorer}
          fileEditorState={mainState.fileEditor}
        />
      )}

      {/* 1st tab - Will contain the file explorer and the file editor. And llm components at the bottom. */}
      <Explorer
        explorerState={mainState.explorer}
        fileEditorState={mainState.fileEditor}
        mainStateDispatch={mainStateDispatch}
        parentNode={mainState.explorer.explorerTreeRoot}
        className={`row-start-2 ${explorerVisibility}`}
      />

      <FileEditor
        fileEditorState={mainState.fileEditor}
        globalEditorSettings={mainState.globalEditorSettings}
        mainStateDispatch={mainStateDispatch}
        explorerState={mainState.explorer}
        className={`row-start-2 ${editorVisibility}`}
      />

      {/* Prompt components will be visible in both the 1st tab (editor and explorer) and 2nd tab (terminal). */}
      <PromptTabs
        promptEditorState={mainState.promptEditor}
        mainStateDispatch={mainStateDispatch}
        className="row-start-4 flex flex-col"
      />

      <PromptEditor
        fileEditorState={mainState.fileEditor}
        globalEditorSettings={mainState.globalEditorSettings}
        mainStateDispatch={mainStateDispatch}
        explorerState={mainState.explorer}
        className={`row-start-4 ${promptEditorVisibility}`}
      />

      {/* 2nd tab - Will contain the file explorer and the file editor. */}
      {!!socket && (
        <MyTerminal
          socket={socket}
          className={`col-span-full ${terminalVisibility}`}
        />
      )}

      {/* 3rd tab - Will contain the file explorer and the file editor. */}
      <Settings
        fileEditorState={mainState.fileEditor}
        mainStateDispatch={mainStateDispatch}
        className={`col-span-full ${settingsVisibility}`}
      />

      {/* <Benchmarks className={}/> */}

      <MainFooter
        fileEditorState={mainState.fileEditor}
        activeIndex={activeMainTab}
      />
    </div>
  );
};
