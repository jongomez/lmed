import {
  FileEditorState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { FileEditorTabs, TabsOnTheLeft, TabsOnTheRight } from "./Tabs.server";

type MainHeaderProps = {
  activeMainTab: number;
  isMainMenuOpen: boolean;
  mainStateDispatch: MainStateDispatch;
  fileEditorState: FileEditorState;
  explorerNodeMap: MainState["explorerNodeMap"];
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const MainHeader = ({
  activeMainTab,
  isMainMenuOpen,
  mainStateDispatch,
  fileEditorState,
  explorerNodeMap,
  fileEditorRef,
}: MainHeaderProps) => {
  return (
    <div
      className="flex z-30 w-screen h-[42px]
  border-b-2 border-innactive-colors bg-white dark:bg-slate-800"
    >
      <TabsOnTheLeft
        activeIndex={activeMainTab}
        mainStateDispatch={mainStateDispatch}
        isMainMenuOpen={isMainMenuOpen}
      />
      <FileEditorTabs
        activeMainTab={activeMainTab}
        fileEditorState={fileEditorState}
        explorerNodeMap={explorerNodeMap}
        mainStateDispatch={mainStateDispatch}
        fileEditorRef={fileEditorRef}
      />
      <TabsOnTheRight
        activeIndex={activeMainTab}
        mainStateDispatch={mainStateDispatch}
      />
    </div>
  );
};
