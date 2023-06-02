import {
  ExplorerState,
  FileEditorState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { FileEditorTabs, MainTabs } from "./Tabs.server";

type MainHeaderProps = {
  activeMainTab: number;
  isMainMenuOpen: boolean;
  mainStateDispatch: MainStateDispatch;
  fileEditorState: FileEditorState;
  explorerState: ExplorerState;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const MainHeader = ({
  activeMainTab,
  isMainMenuOpen,
  mainStateDispatch,
  fileEditorState,
  explorerState,
  fileEditorRef,
}: MainHeaderProps) => {
  return (
    <div
      className="flex z-30 w-screen h-[42px]
  border-b-2 border-innactive-colors bg-white dark:bg-slate-800"
    >
      <MainTabs
        activeIndex={activeMainTab}
        mainStateDispatch={mainStateDispatch}
        isMainMenuOpen={isMainMenuOpen}
      />
      <FileEditorTabs
        activeIndex={activeMainTab}
        fileEditorState={fileEditorState}
        explorerState={explorerState}
        mainStateDispatch={mainStateDispatch}
        fileEditorRef={fileEditorRef}
      />
    </div>
  );
};
