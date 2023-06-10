import {
  FileEditorState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { FileEditorTabs, TabsOnTheLeft, TabsOnTheRight } from "./Tabs.server";

type MainHeaderProps = {
  mainStateDispatch: MainStateDispatch;
  fileEditorState: FileEditorState;
  explorerNodeMap: MainState["explorerNodeMap"];
  activeHeaderItems: MainState["activeHeaderItems"];
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const MainHeader = ({
  activeHeaderItems,
  mainStateDispatch,
  fileEditorState,
  explorerNodeMap,
  fileEditorRef,
}: MainHeaderProps) => {
  return (
    <div
      className="flex justify-between z-30 w-screen h-[42px]
  border-b-2 border-innactive-colors bg-main-colors"
    >
      <div className="flex">
        <TabsOnTheLeft
          activeHeaderItems={activeHeaderItems}
          mainStateDispatch={mainStateDispatch}
        />
        <FileEditorTabs
          isEditorShowing={activeHeaderItems.fileEditor}
          fileEditorState={fileEditorState}
          explorerNodeMap={explorerNodeMap}
          mainStateDispatch={mainStateDispatch}
          fileEditorRef={fileEditorRef}
        />
      </div>
      <div>
        <TabsOnTheRight
          activeHeaderItems={activeHeaderItems}
          mainStateDispatch={mainStateDispatch}
        />
      </div>
    </div>
  );
};
