import type { EditorTheme, Language } from "@/utils/editorUtils";
import type { Delta } from "@/utils/hooks";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import type { Dispatch } from "react";

export type FileNode = {
  path: string;
  type: "file";
  name: string;
  selected: boolean;
  openInTab: boolean;
  language: Language;
  fileHandle?: FileSystemFileHandle; // for files that exist on disk.
  memoryOnlyFile?: File; // for files that exist only in memory, not on disk. e.g. if a user creates a new file.
  serializedEditorState?: string; // if the file has not been selected yet, no editorState will be present.
  parentDirectory?: DirectoryNode; // if a user created a new file, it won't have a parent directory.
};

export type DirectoryNode = {
  path: string; // will work as a unique identifier for the directory.
  type: "directory";
  name: string;
  directoryHandle: FileSystemDirectoryHandle;
  expanded: boolean;
  hasCreatedChildren: boolean;
  parentDirectory?: DirectoryNode; // the root directory will not have a parent directory.
};

export type ExplorerNode = FileNode | DirectoryNode;

export type ExplorerState = {
  explorerNodeMap: Map<string, ExplorerNode>;
};

export type FileEditorTab = {
  fileNode: FileNode;
};

export type PromptTab = {
  selected: boolean;
  tabName: "Current Prompt" | "Prompt Source Code" | "History";
};

export type FileEditorState = {
  openFilePaths: string[];
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
  | {
      type: "OPEN_FILE";
      payload: { newNode: FileNode; fileEditor: ReactCodeMirrorRef };
    }
  | { type: "OPEN_DIRECTORY"; payload: ExplorerNode[] }
  | {
      type: "DIRECTORY_TOGGLE_EXPANDED";
      payload: {
        directoryClicked: DirectoryNode;
      };
    }
  | {
      type: "SWITCH_FILE";
      payload: { fileNode: FileNode; fileEditor: ReactCodeMirrorRef };
    }
  | {
      type: "CREATE_NEW_FILE";
      payload: { newNode: FileNode; fileEditor: ReactCodeMirrorRef };
    }
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
  | {
      type: "CREATE_NEW_FILE";
      payload: { newNode: FileNode; fileEditor: ReactCodeMirrorRef };
    }
  | {
      type: "DIRECTORY_CREATE_CHILDREN";
      payload: {
        directoryChildrenToCreate: ExplorerNode[];
        directoryClicked: DirectoryNode;
      };
    };

export type MainStateDispatch = Dispatch<MainStateAction>;

export type MainStateReducer = (
  state: MainState,
  action: MainStateAction
) => MainState;
