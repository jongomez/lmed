import { EditorTheme, Language } from "@/utils/editorUtils";
import type { Dispatch, Ref } from "react";
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
  selected: boolean;
  fileHandle?: FileSystemFileHandle; // for files that exist on disk.
  file?: File; // for files that exist only in memory, not on disk. e.g. if a user creates a new file.
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
  mainTab: number;
};

export type MainStateAction =
  | { type: "SET_SOCKET"; payload: Socket }
  | { type: "SET_MAIN_TAB"; payload: number }
  | { type: "OPEN_FILE"; payload: FileNode }
  | { type: "OPEN_DIRECTORY"; payload: RootNode }
  | { type: "EXPLORER_DIRECTORY_CLICK"; payload: DirectoryNode }
  | {
      type: "EXPLORER_FILE_CLICK";
      payload: { fileNode: FileNode; file: File; contents: string };
    }
  | { type: "CREATE_NEW_FILE"; payload: FileNode };

export type MainStateDispatch = Dispatch<MainStateAction>;

export type MainStateReducer = (
  state: MainState,
  action: MainStateAction
) => MainState;
