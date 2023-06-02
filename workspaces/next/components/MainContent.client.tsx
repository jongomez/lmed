"use client";

import type { MainState, MainStateAction } from "@/types/MainTypes";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useImmerReducer } from "use-immer";
import { Settings } from "./Settings.client";
// import { MainTabHeader } from "./Tabs.server";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useRef } from "react";
import { FileAndPromptEditors } from "./FileAndPromptEditors.client";
import { MainHeader } from "./MainHeader.client";
import { MainMenu } from "./MainMenu.server";
import { MyTerminal } from "./Terminal.client";

export const MainContent = () => {
  // The following refs contain fairly complex objects. I think immer doesn't like them.
  // The refs are also mutable, so putting them in state or context is probably not a great idea.
  const fileEditorRef = useRef<ReactCodeMirrorRef>({});
  const promptEditorRef = useRef<ReactCodeMirrorRef>({});
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
        explorerState={mainState.explorer}
        fileEditorRef={fileEditorRef}
      />

      {/* Main menu. This is a pop-up menu that will be accessible in all tabs. */}
      {isMainMenuOpen && (
        <MainMenu
          mainStateDispatch={mainStateDispatch}
          explorerState={mainState.explorer}
          fileEditorState={mainState.fileEditor}
          fileEditorRef={fileEditorRef}
        />
      )}

      {/* 1st tab - Will contain file editor, file explorer, and prompt editor. */}
      <FileAndPromptEditors
        mainState={mainState}
        mainStateDispatch={mainStateDispatch}
        activeTab={activeMainTab}
        fileEditorRef={fileEditorRef}
      />

      {/* 2nd tab - Will contain the file explorer and the file editor. */}
      <MyTerminal activeTab={activeMainTab} />

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
