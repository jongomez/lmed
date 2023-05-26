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
import { EditorFileTabs, MainTabs } from "./Tabs.server";
import { MyTerminal } from "./Terminal.client";

export const MainContent = () => {
  // Socket is not part of the mainState because I was getting some immer type errors.
  const socket = useSocket();
  const [mainState, mainStateDispatch] = useImmerReducer<
    MainState,
    MainStateAction
  >(mainStateReducer, getInitialState());

  const activeMainTab = mainState.mainTab;
  const isMainMenuOpen = mainState.isMainMenuOpen;

  const explorerVisibility = activeMainTab === 0 ? "" : "hidden";
  const editorVisibility = activeMainTab === 0 ? "" : "hidden";
  const llmHelperVisibility = activeMainTab === 0 ? "" : "hidden";
  const terminalVisibility = activeMainTab === 1 ? "" : "hidden";
  const settingsVisibility = activeMainTab === 2 ? "" : "hidden";

  const tabGridClasses = [
    "grid-rows-[42px_7fr_3fr_24px] grid-cols-[minmax(150px,_300px)_1fr]",
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
        <EditorFileTabs
          editorState={mainState.editor}
          mainStateDispatch={mainStateDispatch}
        />
      </div>

      {isMainMenuOpen && (
        <MainMenu
          mainStateDispatch={mainStateDispatch}
          explorerState={mainState.explorer}
          editorState={mainState.editor}
        />
      )}

      <Explorer
        explorerState={mainState.explorer}
        editorState={mainState.editor}
        mainStateDispatch={mainStateDispatch}
        parentNode={mainState.explorer.explorerTreeRoot}
        className={`row-start-2 ${explorerVisibility}`}
      />

      <FileEditor
        editorState={mainState.editor}
        mainStateDispatch={mainStateDispatch}
        explorerState={mainState.explorer}
        className={`row-start-2 ${editorVisibility}`}
      />

      <LLMNavigation
        editorState={mainState.editor}
        mainStateDispatch={mainStateDispatch}
        className={`row-start-3 ${llmHelperVisibility}`}
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
