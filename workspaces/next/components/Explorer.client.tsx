"use client";

import type {
  DirectoryNode,
  EditorState,
  ExplorerNode,
  ExplorerState,
  MainStateDispatch,
  RootNode,
} from "@/types/MainTypes";
import { handleDirectoryClick, handleFileClick } from "@/utils/explorerUtils";
import {
  createNewFile,
  openDirectory,
  openFile,
  saveFile,
  saveFileAs,
} from "@/utils/mainMenuUtils";
import { ChevronDown, ChevronUp, File } from "lucide-react";
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
    <Ul className="overflow-auto max-h-full">
      {parentNode.children.map((node, index) => (
        <Li key={index}>{renderNode(node)}</Li>
      ))}
    </Ul>
  );
};

type ExplorerProps = {
  explorerState: ExplorerState;
  editorState: EditorState;
  mainStateDispatch: MainStateDispatch;
  parentNode: RootNode | DirectoryNode;
};

export const Explorer = ({
  parentNode,
  explorerState,
  editorState,
  mainStateDispatch,
}: ExplorerProps) => {
  return (
    <div className="flex flex-col justify-between flex-grow-0 flex-shrink-0">
      <ExplorerList {...{ parentNode, explorerState, mainStateDispatch }} />
      <div className="w-80 flex flex-col items-center">
        <div className="flex justify-center flex-wrap">
          <Button onClick={() => openFile(mainStateDispatch, explorerState)}>
            Open File
          </Button>
          <Button
            onClick={() => openDirectory(mainStateDispatch, explorerState)}
          >
            Open Directory
          </Button>
        </div>
        <div className="flex justify-center flex-wrap">
          <Button
            onClick={() =>
              saveFile(mainStateDispatch, explorerState, editorState)
            }
          >
            Save
          </Button>
          <Button
            onClick={() =>
              saveFileAs(mainStateDispatch, explorerState, editorState)
            }
          >
            Save As...
          </Button>
        </div>
        <div className="flex justify-center flex-wrap">
          <Button
            onClick={() =>
              createNewFile(mainStateDispatch, explorerState, editorState)
            }
          >
            New File
          </Button>
        </div>
      </div>
    </div>
  );
};
