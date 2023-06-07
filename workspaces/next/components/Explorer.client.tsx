"use client";

import {
  DirectoryNode,
  ExplorerNode,
  FileNode,
  MainState,
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
  explorerNodeMap: MainState["explorerNodeMap"];
  mainStateDispatch: MainStateDispatch;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  indentationLevel: number;
};

const FileNodeTab = ({
  fileNode,
  explorerNodeMap,
  mainStateDispatch,
  fileEditorRef,
  indentationLevel,
}: FileNodeTabProps) => {
  return (
    <SideTab isActive={isExplorerNodeSelected(fileNode, explorerNodeMap)}>
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
  explorerNodeMap: MainState["explorerNodeMap"];
  indentationLevel: number;
};

const DirectoryNodeTab = ({
  directoryNode,
  mainStateDispatch,
  explorerNodeMap,
  indentationLevel,
}: DirectoryNodeTabProps) => {
  return (
    <SideTab isActive={false}>
      <div
        onClick={() =>
          handleDirectoryClick(
            directoryNode,
            mainStateDispatch,
            explorerNodeMap
          )
        }
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
  explorerNodeMap: MainState["explorerNodeMap"]
): boolean => {
  const selectedNode = explorerNodeMap.get(node.path);
  return selectedNode?.type === "file" && selectedNode.selected;
};

type ExplorerListProps = {
  explorerNodeMap: MainState["explorerNodeMap"];
  mainStateDispatch: MainStateDispatch;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  indentationLevel: number;
  parentNode?: DirectoryNode;
};

// Recursive function.
const ExplorerList = ({
  parentNode,
  explorerNodeMap,
  mainStateDispatch,
  indentationLevel,
  fileEditorRef,
}: ExplorerListProps) => {
  const childNodes = [...explorerNodeMap.values()].filter(
    (node) => node.parentDirectoryPath === parentNode?.path
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
                explorerNodeMap={explorerNodeMap}
              />

              {node.expanded && (
                <ExplorerList
                  parentNode={node}
                  explorerNodeMap={explorerNodeMap}
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
              explorerNodeMap={explorerNodeMap}
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
  explorerNodeMap: MainState["explorerNodeMap"];
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  mainStateDispatch: MainStateDispatch;
  className: string;
};

export const Explorer = ({
  explorerNodeMap,
  fileEditorRef,
  mainStateDispatch,
  className,
}: ExplorerProps) => {
  const iconSize = 24;
  const iconClasses = "inline mr-2";
  const buttonClasses = "min-w-[150px] w-[180px] m-1";

  return (
    <div
      className={`${className} flex flex-col justify-between overflow-hidden`}
    >
      <ExplorerList
        explorerNodeMap={explorerNodeMap}
        fileEditorRef={fileEditorRef}
        mainStateDispatch={mainStateDispatch}
        indentationLevel={0}
      />
      <div className="w-90 flex flex-col items-center">
        <div className="flex justify-center flex-wrap">
          <Button
            onClick={() =>
              openFile(mainStateDispatch, fileEditorRef, explorerNodeMap)
            }
            className={buttonClasses}
          >
            <File size={iconSize} className={iconClasses} />
            Open File
          </Button>
          <Button
            onClick={() => openDirectory(mainStateDispatch, explorerNodeMap)}
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
