import {
  ExplorerState,
  FileEditorState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { FileEditorTabs, MainTabs } from "./Tabs.server";

type MainHeaderProps = {
  activeMainTab: number;
  isMainMenuOpen: boolean;
  mainStateDispatch: MainStateDispatch;
  fileEditorState: FileEditorState;
  explorerState: ExplorerState;
};

export const MainHeader = ({
  activeMainTab,
  isMainMenuOpen,
  mainStateDispatch,
  fileEditorState,
  explorerState,
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
      />
    </div>
  );
};
