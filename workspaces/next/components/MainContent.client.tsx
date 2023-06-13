"use client";

import type { MainState, MainStateAction } from "@/types/MainTypes";
import { getInitialState, mainStateReducer } from "@/utils/mainStateUtils";
import { useImmerReducer } from "use-immer";
import { Settings } from "./Settings.client";
// import { MainTabHeader } from "./Tabs.server";
import { useStateFromLocalStorage } from "@/utils/hooks/randomHooks";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { useRef } from "react";
import { MainGrid } from "./MainGrid.server";
import { MainHeader } from "./MainHeader.client";
import { MainMenu } from "./MainMenu.server";

export const MainContent = () => {
  // The following ReactCodeMirrorRef is a fairly complex object. I think immer doesn't like it.
  // The ref is also mutable, so putting it in state or context is probably not a great idea.
  const fileEditorRef = useRef<ReactCodeMirrorRef>({});
  const [mainState, mainStateDispatch] = useImmerReducer<
    MainState,
    MainStateAction
  >(mainStateReducer, getInitialState());
  // Get state from local storage. This is wrapped in a useEffect because of NextJS SSR stuff.
  useStateFromLocalStorage(mainStateDispatch);

  return (
    // <div className={`h-screen w-screen grid ${tabGridClasses[activeMainTab]}`}>
    <div>
      <MainHeader
        activeHeaderItems={mainState.activeHeaderItems}
        mainStateDispatch={mainStateDispatch}
        fileEditorState={mainState.fileEditor}
        explorerNodeMap={mainState.explorerNodeMap}
        fileEditorRef={fileEditorRef}
      />

      {/* Main menu. This is a pop-up menu that will be accessible in all tabs. */}
      {mainState.activeHeaderItems.mainMenu && (
        <MainMenu
          mainStateDispatch={mainStateDispatch}
          explorerNodeMap={mainState.explorerNodeMap}
          fileEditorState={mainState.fileEditor}
          fileEditorRef={fileEditorRef}
        />
      )}

      <MainGrid
        mainState={mainState}
        mainStateDispatch={mainStateDispatch}
        activeHeaderItems={mainState.activeHeaderItems}
        fileEditorRef={fileEditorRef}
      />

      <Settings
        fileEditorState={mainState.fileEditor}
        mainStateDispatch={mainStateDispatch}
        settings={mainState.settings}
        isSettingsActive={mainState.activeHeaderItems.settings}
      />

      {/* <Benchmarks className={}/> */}

      {/* <MainFooter
        fileEditorState={mainState.fileEditor}
        activeIndex={activeMainTab}
      /> */}
    </div>
  );
};
