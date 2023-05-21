import { EditorTheme, Language } from "@/utils/editorUtils";
import type { Dispatch, Ref, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

export type RootNode = {
  id: 0;
  name: "root";
  type: "root";
  treeLength: number;
  children: ExplorerNode[];
};

export type FileNode = ExplorerNodeBase & {
  type: "file";
  fileHandle: FileSystemFileHandle | null;
  selected: boolean;
};

export type DirectoryNode = ExplorerNodeBase & {
  type: "directory";
  directoryHandle: FileSystemDirectoryHandle;
  children: RootNode["children"];
  expanded: boolean;
};

export type ExplorerNodeBase = {
  id: number;
  name: string;
  type: "file" | "directory" | "root";
  parentNode: RootNode | DirectoryNode;
};

export type ExplorerNode = RootNode | FileNode | DirectoryNode;

export type ExplorerState = {
  explorerTreeRoot: RootNode;
  selectedNode: ExplorerNode | null;
  idCounter: number;
};

export type EditorTab = {
  fileNode: FileNode;
  selected: boolean;
  name: string;
  // For the diff editor there can be 2 strings, 1 for each side of the diff editor. Hence the str array.
  value: string[];
  language: Language;
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
  theme: EditorTheme;
};

export type SiteTheme = "light" | "dark";

export type MainState = {
  socket: Socket | undefined;
  tabIndex: number;
  editor: EditorState;
  explorer: ExplorerState;
};

export type SetMainState = Dispatch<SetStateAction<MainState>>;
