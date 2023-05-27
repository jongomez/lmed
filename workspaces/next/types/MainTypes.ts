import { EditorTheme, Language } from "@/utils/editorUtils";
import type { Dispatch } from "react";

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

export type FileEditorTab = {
  fileNode: FileNode;
  selected: boolean;
  value: string[];
  language: Language;
  hasDiff: boolean;
  // Not sure what this is:
  markers: object;
};

export type PromptTab = {
  selected: boolean;
  tabName: "Current Prompt" | "Prompt Source Code" | "History";
};

export type FileEditorState = {
  currentTab: FileEditorTab;
  allTabs: FileEditorTab[];
  // editorRef: Ref<any>;
};

export type SiteTheme = "light" | "dark";

export type PromptEditorState = {
  currentTab: PromptTab;
  allTabs: PromptTab[];
};

// These settings are shared between the file editor and the LLM prompt editor.
export type GlobalEditorSettings = {
  theme: EditorTheme;
  fontSize: number;
};

export type MainState = {
  iconTabIndex: number;
  globalEditorSettings: GlobalEditorSettings;
  fileEditor: FileEditorState;
  promptEditor: PromptEditorState;
  explorer: ExplorerState;
  isMainMenuOpen: boolean;
};

export type MainStateAction =
  | { type: "SET_ICON_TAB"; payload: number }
  | { type: "OPEN_FILE"; payload: FileNode }
  | { type: "OPEN_DIRECTORY"; payload: RootNode }
  | { type: "EXPLORER_DIRECTORY_CLICK"; payload: DirectoryNode }
  | {
      type: "EXPLORER_FILE_CLICK";
      payload: { fileNode: FileNode; file: File; contents: string };
    }
  | { type: "CREATE_NEW_FILE"; payload: FileNode }
  | { type: "SET_CURRENT_FILE_TAB"; payload: FileEditorTab }
  | { type: "SET_CURRENT_PROMPT_TAB"; payload: PromptTab["tabName"] }
  | { type: "OPEN_MAIN_MENU" }
  | { type: "CLOSE_MAIN_MENU" };

export type MainStateDispatch = Dispatch<MainStateAction>;

export type MainStateReducer = (
  state: MainState,
  action: MainStateAction
) => MainState;
