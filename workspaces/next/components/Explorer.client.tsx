"use client";

import {
  DirectoryNode,
  ExplorerNode,
  ExplorerState,
  FileNode,
  MainStateDispatch,
} from "@/types/MainTypes";
import { handleDirectoryClick, handleFileClick } from "@/utils/explorerUtils";
import { openDirectory, openFile } from "@/utils/mainMenuUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { ChevronDown, ChevronRight, File, FolderOpen } from "lucide-react";
import { MutableRefObject } from "react";
import { SideTab } from "./Tabs.server";
import { Button } from "./base/Button.server";

const ICON_SIZE = 18;

type FileNodeTabProps = {
  fileNode: FileNode;
  explorerState: ExplorerState;
  mainStateDispatch: MainStateDispatch;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  indentationLevel: number;
};

const FileNodeTab = ({
  fileNode,
  explorerState,
  mainStateDispatch,
  fileEditorRef,
  indentationLevel,
}: FileNodeTabProps) => {
  return (
    <SideTab isActive={isExplorerNodeSelected(fileNode, explorerState)}>
      <div
        onClick={() =>
          handleFileClick(fileNode, mainStateDispatch, fileEditorRef.current)
        }
        className="flex items-center"
        style={{
          paddingLeft: `${indentationLevel * 20}px`,
        }}
      >
        <File size={ICON_SIZE} className="mr-1 flex-shrink-0" />
        <span className="overflow-hidden whitespace-nowrap overflow-ellipsis">
          {fileNode.name}
        </span>
      </div>
    </SideTab>
  );
};

type DirectoryNodeTabProps = {
  directoryNode: DirectoryNode;
  mainStateDispatch: MainStateDispatch;
  indentationLevel: number;
};

const DirectoryNodeTab = ({
  directoryNode,
  mainStateDispatch,
  indentationLevel,
}: DirectoryNodeTabProps) => {
  return (
    <SideTab isActive={false}>
      <div
        onClick={() => handleDirectoryClick(directoryNode, mainStateDispatch)}
        className="flex items-center pointer-cursor"
        style={{
          paddingLeft: `${indentationLevel * 20}px`,
        }}
      >
        {directoryNode.expanded ? (
          <ChevronDown size={ICON_SIZE} className="mr-1 flex-shrink-0" />
        ) : (
          <ChevronRight size={ICON_SIZE} className="mr-1 flex-shrink-0" />
        )}
        <span className="overflow-hidden whitespace-nowrap overflow-ellipsis">
          {directoryNode.name}
        </span>
      </div>
    </SideTab>
  );
};

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
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  indentationLevel: number;
  parentNode?: DirectoryNode;
};

// Recursive function.
const ExplorerList = ({
  parentNode,
  explorerState,
  mainStateDispatch,
  indentationLevel,
  fileEditorRef,
}: ExplorerListProps) => {
  const childNodes = [...explorerState.explorerNodeMap.values()].filter(
    (node) => node.parentDirectory?.path === parentNode?.path
  );

  return (
    <div className="overflow-auto">
      {childNodes.map((node) => (
        <div key={node.path}>
          {node.type === "directory" && (
            <>
              <DirectoryNodeTab
                directoryNode={node}
                mainStateDispatch={mainStateDispatch}
                indentationLevel={indentationLevel}
              />

              {node.expanded && (
                <ExplorerList
                  parentNode={node}
                  explorerState={explorerState}
                  mainStateDispatch={mainStateDispatch}
                  fileEditorRef={fileEditorRef}
                  indentationLevel={indentationLevel + 1}
                />
              )}
            </>
          )}

          {node.type === "file" && (
            <FileNodeTab
              fileNode={node}
              explorerState={explorerState}
              mainStateDispatch={mainStateDispatch}
              fileEditorRef={fileEditorRef}
              indentationLevel={indentationLevel}
            />
          )}
        </div>
      ))}
    </div>
  );
};

type ExplorerProps = {
  explorerState: ExplorerState;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  mainStateDispatch: MainStateDispatch;
  className: string;
};

export const Explorer = ({
  explorerState,
  fileEditorRef,
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
        fileEditorRef={fileEditorRef}
        mainStateDispatch={mainStateDispatch}
        indentationLevel={0}
      />
      <div className="w-90 flex flex-col items-center">
        <div className="flex justify-center flex-wrap">
          <Button
            onClick={() => openFile(mainStateDispatch, fileEditorRef)}
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
