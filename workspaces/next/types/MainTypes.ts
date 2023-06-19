import { PromptTemplateMap } from "@/utils/chat/promptUtils";
import type { EditorTheme, Language } from "@/utils/editorUtils";
import { Delta } from "@/utils/hooks/useDrag";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import type { Dispatch } from "react";

type NodeBase = {
  path: string;
  name: string;
  type: "file" | "directory";
  parentDirectoryPath?: string;
};

export type FileNode = NodeBase & {
  type: "file";
  selected: boolean;
  openInTab: boolean;
  language: Language;
  isDirty: boolean;
  fileHandle?: FileSystemFileHandle; // for files that exist on disk.
  memoryOnlyFile?: File; // for files that exist only in memory, not on disk. e.g. if a user creates a new file.
  serializedEditorState?: string; // if the file has not been selected yet, no editorState will be present.
};

export type DirectoryNode = NodeBase & {
  type: "directory";
  directoryHandle: FileSystemDirectoryHandle;
  expanded: boolean;
  hasCreatedChildren: boolean;
};

export type ExplorerNode = FileNode | DirectoryNode;

export type FileEditorTab = {
  fileNode: FileNode;
};

type PromptTabName = "Current Prompt" | "Prompt Source Code" | "Chat";

export type PromptTab = {
  selected: boolean;
  tabName: PromptTabName;
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
  mode: "horizontal" | "vertical";
};

export type HeaderItem =
  | "fileEditor"
  | "terminal"
  | "chat"
  | "explorer"
  | "mainMenu"
  | "settings";

export type MainState = {
  settings: {
    globalEditorSettings: GlobalEditorSettings;
    openAIAPIKey: string;
  };
  fileEditor: FileEditorState;
  promptEditor: PromptEditorState;
  layout: LayoutState;
  explorerNodeMap: Map<string, ExplorerNode>;
  promptTemplateMap: PromptTemplateMap;
  promptSuggestion: string;
  lastLLMResponse: string;
  activeHeaderItems: {
    [key in HeaderItem]: boolean;
  };
  chatState: ChatState;
  // selectedFileNodePath: string;
};

export type MainStateAction =
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
    }
  | {
      type: "CLOSE_FILE";
      payload: {
        fileNode: FileNode;
        fileEditor: ReactCodeMirrorRef;
      };
    }
  | {
      type: "UPDATE_FILE_IS_DIRTY";
      payload: {
        fileNode: FileNode;
        isDirty: boolean;
      };
    }
  | {
      type: "SAVE_AS";
      payload: {
        fileNode: FileNode;
        fileHandle: FileSystemFileHandle;
      };
    }
  | {
      type: "SET_SELECTED_PROMPT";
      payload: { promptName: string };
    }
  | {
      type: "SET_CHAT_PROMPT_SUGGESTION";
      payload: string;
    }
  | {
      type: "TOGGLE_MAIN_MENU";
    }
  | {
      type: "TOGGLE_SETTINGS";
    }
  | {
      type: "ACTIVATE_CHAT";
    }
  | {
      type: "ACTIVATE_EXPLORER";
    }
  | {
      type: "ACTIVATE_FILE_EDITOR";
    }
  | {
      type: "ACTIVATE_TERMINAL";
    }
  | {
      type: "SET_STATE_FROM_LOCAL_STORAGE";
      payload: { layout: LayoutState };
    }
  | {
      type: "SET_OPENAI_API_KEY";
      payload: string;
    }
  | {
      type: "UPDATE_CHAT_STATE";
      payload: {
        newMessage?: ChatMessage;
        isLoadingMessage?: boolean;
        abortController?: AbortController;
        errorMessage?: string;
        textAreaValue?: string;
      };
    };

export type MainStateDispatch = Dispatch<MainStateAction>;

export type MainStateReducer = (
  state: MainState,
  action: MainStateAction
) => MainState;

export type ChatMessage = {
  role: "user" | "system" | "assistant";
  content: string;
  // origin?: "chat" | "codemirror"; // pressing ctrl-space on the codemirror editor will send a message to the chat.
};

export type ChatState = {
  messages: ChatMessage[];
  isLoadingMessage: boolean;
  errorMessage: string;
  charCount: number;
  abortController?: AbortController;
};
