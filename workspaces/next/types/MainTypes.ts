import type { EditorTheme, Language } from "@/utils/editorUtils";
import type { Delta } from "@/utils/hooks";
import type { EditorState } from "@codemirror/state";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
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
  language: Language;
  fileHandle?: FileSystemFileHandle; // for files that exist on disk.
  memoryOnlyFile?: File; // for files that exist only in memory, not on disk. e.g. if a user creates a new file.
  editorState: EditorState;
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
  idCounter: number;
};

export type FileEditorTab = {
  fileNode: FileNode;
  /*
  
  value: string[];
  hasDiff: boolean;
  // Not sure what this is:
  markers: object;

  */
};

export type PromptTab = {
  selected: boolean;
  tabName: "Current Prompt" | "Prompt Source Code" | "History";
};

export type FileEditorState = {
  allTabs: FileEditorTab[];
  fileEditorRef: ReactCodeMirrorRef | null;
};

export type SiteTheme = "light" | "dark";

export type PromptEditorState = {
  allTabs: PromptTab[];
};

// These settings are shared between the file editor and the LLM prompt editor.
export type GlobalEditorSettings = {
  theme: EditorTheme;
  fontSize: number;
};

export type LayoutState = {
  resizableRowSize: number;
  resizableColSize: number;
};

export type MainState = {
  iconTabIndex: number;
  globalEditorSettings: GlobalEditorSettings;
  fileEditor: FileEditorState;
  promptEditor: PromptEditorState;
  explorer: ExplorerState;
  layout: LayoutState;
  isMainMenuOpen: boolean;
};

export type MainStateAction =
  | { type: "SET_ICON_TAB"; payload: number }
  | { type: "OPEN_FILE"; payload: FileNode }
  | { type: "OPEN_DIRECTORY"; payload: RootNode }
  | { type: "EXPLORER_DIRECTORY_CLICK"; payload: DirectoryNode }
  | {
      type: "SWITCH_FILE";
      payload: { fileNode: FileNode };
    }
  | { type: "CREATE_NEW_FILE"; payload: FileNode }
  | { type: "SET_CURRENT_PROMPT_TAB"; payload: PromptTab["tabName"] }
  | { type: "OPEN_MAIN_MENU" }
  | { type: "CLOSE_MAIN_MENU" }
  | {
      type: "RESIZE_EDITORS_HORIZONTALLY";
      payload: { event: PointerEvent; delta: Delta; initialRowSize: number };
    }
  | {
      type: "RESIZE_EDITORS_VERTICALLY";
      payload: { event: PointerEvent; delta: Delta; initialColSize: number };
    }
  | { type: "SET_FILE_EDITOR_REF"; payload: ReactCodeMirrorRef };

export type MainStateDispatch = Dispatch<MainStateAction>;

export type MainStateReducer = (
  state: MainState,
  action: MainStateAction
) => MainState;
