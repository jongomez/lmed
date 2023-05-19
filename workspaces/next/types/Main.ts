import type { Dispatch, Ref, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

export type ExplorerNodeBase = {
  id: number;
  name: string;
  type: "file" | "folder" | "root";
};

export type RootNode = {
  id: 0;
  name: "root";
  type: "root";
  treeLength: number;
  children: ExplorerNode[];
};

export type FileNode = ExplorerNodeBase & {
  type: "file";
  fileHandle: FileSystemFileHandle;
  selected: boolean;
};

export type FolderNode = ExplorerNodeBase & {
  type: "folder";
  folderHandle: FileSystemDirectoryHandle;
  children: RootNode["children"];
  expanded: boolean;
};

export type ExplorerNode = RootNode | FileNode | FolderNode;

export type ExplorerState = {
  explorerTreeRoot: RootNode;
  selectedNode: ExplorerNode | null;
  idCounter: number;
};

export type EditorTab = {
  file: FileNode;
  selected: boolean;
  name: string;
  // For the diff editor there can be 2 strings, 1 for each side of the diff editor. Hence the str array.
  value: string[];
  mode: string;
  hasDiff: boolean;
  // Not sure what this is:
  markers: object;
};

export type EditorState = {
  currentTab: EditorTab;
  allTabs: EditorTab[];
  fontSize: number;
  // editorRef: Ref<any>;
  diffEditorRef: Ref<any>;
};

export type MainState = {
  socket: Socket | undefined;
  tabIndex: number;
  editor: EditorState;
  explorer: ExplorerState;
};

export type SetMainState = Dispatch<SetStateAction<MainState>>;
