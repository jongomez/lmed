"use client";

import type {
  DirectoryNode,
  ExplorerNode,
  ExplorerState,
  RootNode,
  SetMainState,
} from "@/types/Main";
import {
  handleDirectoryClick,
  handleFileClick,
  openDirectory,
  openFile,
} from "@/utils/explorerUtils";
import { ChevronDown, ChevronUp, File } from "lucide-react";
import { Button } from "./base/Button.server";
import { Li, Ul } from "./base/Typography.server";

type ExplorerProps = {
  explorerState: ExplorerState;
  setMainState: SetMainState;
  parentNode: RootNode | DirectoryNode;
};

const ExplorerList = ({
  parentNode,
  explorerState,
  setMainState,
}: ExplorerProps) => {
  const renderNode = (node: ExplorerNode) => {
    switch (node.type) {
      case "directory":
        return (
          <div>
            <button onClick={() => handleDirectoryClick(node, setMainState)}>
              {node.expanded ? <ChevronDown /> : <ChevronUp />}
              {node.name}
            </button>
            {node.expanded && (
              <ExplorerList
                parentNode={node}
                explorerState={explorerState}
                setMainState={setMainState}
              />
            )}
          </div>
        );

      case "file":
        return (
          <div
            key={node.id}
            onClick={() => handleFileClick(node, setMainState)}
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
    <Ul>
      {parentNode.children.map((node, index) => (
        <Li key={index}>{renderNode(node)}</Li>
      ))}
    </Ul>
  );
};

export const Explorer = ({
  parentNode,
  explorerState,
  setMainState,
}: ExplorerProps) => {
  return (
    <div className="flex flex-col justify-between">
      <ExplorerList {...{ parentNode, explorerState, setMainState }} />
      <div className="w-80 flex flex-col items-center">
        <div className="flex justify-center flex-wrap">
          <Button onClick={() => openFile(setMainState, explorerState)}>
            Open File
          </Button>
          <Button onClick={() => openDirectory(setMainState, explorerState)}>
            Open Directory
          </Button>
        </div>
        <div className="flex justify-center flex-wrap">
          <Button>Save</Button>
          <Button>Save As...</Button>
        </div>
      </div>
    </div>
  );
};
