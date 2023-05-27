"use client";

import type {
  DirectoryNode,
  ExplorerNode,
  ExplorerState,
  FileEditorState,
  MainStateDispatch,
  RootNode,
} from "@/types/MainTypes";
import { handleDirectoryClick, handleFileClick } from "@/utils/explorerUtils";
import { openDirectory, openFile } from "@/utils/mainMenuUtils";
import { ChevronDown, ChevronUp, File, FolderOpen } from "lucide-react";
import { Button } from "./base/Button.server";
import { Li, Ul } from "./base/Typography.server";

type ExplorerListProps = {
  explorerState: ExplorerState;
  mainStateDispatch: MainStateDispatch;
  parentNode: RootNode | DirectoryNode;
};

// Recursive function.
const ExplorerList = ({
  parentNode,
  explorerState,
  mainStateDispatch,
}: ExplorerListProps) => {
  const renderNode = (node: ExplorerNode) => {
    switch (node.type) {
      case "directory":
        return (
          <div>
            <button
              onClick={() => handleDirectoryClick(node, mainStateDispatch)}
            >
              {node.expanded ? <ChevronDown /> : <ChevronUp />}
              {node.name}
            </button>
            {node.expanded && (
              <ExplorerList
                parentNode={node}
                explorerState={explorerState}
                mainStateDispatch={mainStateDispatch}
              />
            )}
          </div>
        );

      case "file":
        return (
          <div
            key={node.id}
            onClick={() => handleFileClick(node, mainStateDispatch)}
            className="flex"
          >
            <File />
            {node.name}
          </div>
        );

      case "root":
        return null;
    }
  };

  return (
    <Ul className="overflow-auto">
      {parentNode.children.map((node, index) => (
        <Li key={index}>{renderNode(node)}</Li>
      ))}
    </Ul>
  );
};

type ExplorerProps = {
  explorerState: ExplorerState;
  fileEditorState: FileEditorState;
  mainStateDispatch: MainStateDispatch;
  parentNode: RootNode | DirectoryNode;
  className: string;
};

export const Explorer = ({
  parentNode,
  explorerState,
  fileEditorState,
  mainStateDispatch,
  className,
}: ExplorerProps) => {
  const iconSize = 24;
  const iconClasses = "inline mr-2";
  const buttonClasses = "w-[180px]";

  return (
    <div
      className={`${className} flex flex-col justify-between overflow-hidden max-w-[300px]`}
    >
      <ExplorerList {...{ parentNode, explorerState, mainStateDispatch }} />
      <div className="w-90 flex flex-col items-center">
        <div className="flex justify-center flex-wrap">
          <Button
            onClick={() => openFile(mainStateDispatch, explorerState)}
            className={buttonClasses}
          >
            <File size={iconSize} className={iconClasses} />
            Open File
          </Button>
          <Button
            onClick={() => openDirectory(mainStateDispatch, explorerState)}
            className={buttonClasses}
          >
            <FolderOpen size={iconSize} className={iconClasses} />
            Open Directory
          </Button>
          {/* <Button
            onClick={() =>
              createNewFile(mainStateDispatch, explorerState, fileEditorState)
            }
            className={buttonClasses}
          >
            <FilePlus size={iconSize} className={iconClasses} />
            New File
          </Button> */}
        </div>
      </div>
    </div>
  );
};
