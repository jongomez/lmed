"use client";

import {
  DirectoryNode,
  ExplorerNode,
  ExplorerState,
  FileEditorState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { handleDirectoryClick, handleFileClick } from "@/utils/explorerUtils";
import { openDirectory, openFile } from "@/utils/mainMenuUtils";
import { ChevronDown, ChevronUp, File, FolderOpen } from "lucide-react";
import { SideTab } from "./Tabs.server";
import { Button } from "./base/Button.server";

const isExplorerNodeSelected = (
  node: ExplorerNode,
  explorerState: ExplorerState
): boolean => {
  const selectedNode = explorerState.explorerNodeMap.get(node.path);
  return selectedNode?.type === "file" && selectedNode.selected;
};

type ExplorerListProps = {
  explorerState: ExplorerState;
  mainStateDispatch: MainStateDispatch;
  parentNode?: DirectoryNode;
};

// Recursive function.
const ExplorerList = ({
  parentNode,
  explorerState,
  mainStateDispatch,
}: ExplorerListProps) => {
  const iconSize = 18;
  const childNodes = Array.from(explorerState.explorerNodeMap.values()).filter(
    (node) => node.parentDirectory?.path === parentNode?.path
  );

  return (
    <div className="overflow-auto">
      {childNodes.map((node) => (
        <SideTab
          key={node.path}
          isActive={isExplorerNodeSelected(node, explorerState)}
        >
          {node.type === "directory" && (
            <div>
              <button
                onClick={() => handleDirectoryClick(node, mainStateDispatch)}
              >
                {node.expanded ? (
                  <ChevronDown size={iconSize} />
                ) : (
                  <ChevronUp size={iconSize} />
                )}
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
          )}

          {node.type === "file" && (
            <div
              onClick={() => handleFileClick(node, mainStateDispatch)}
              className="flex items-center"
            >
              <File size={iconSize} className="mr-1" />
              {node.name}
            </div>
          )}
        </SideTab>
      ))}
    </div>
  );
};
type ExplorerProps = {
  explorerState: ExplorerState;
  fileEditorState: FileEditorState;
  mainStateDispatch: MainStateDispatch;
  className: string;
};

export const Explorer = ({
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
      className={`${className} flex flex-col justify-between overflow-hidden`}
    >
      <ExplorerList
        explorerState={explorerState}
        mainStateDispatch={mainStateDispatch}
      />
      <div className="w-90 flex flex-col items-center">
        <div className="flex justify-center flex-wrap">
          <Button
            onClick={() => openFile(mainStateDispatch)}
            className={buttonClasses}
          >
            <File size={iconSize} className={iconClasses} />
            Open File
          </Button>
          <Button
            onClick={() =>
              openDirectory(mainStateDispatch, explorerState.explorerNodeMap)
            }
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
