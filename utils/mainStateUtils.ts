"use client";

import type {
  ExplorerNode,
  MainState,
  MainStateAction,
  PromptTab,
} from "@/types/MainTypes";
import { enableMapSet } from "immer";
import {
  defaultPromptTemplateMap,
  getCurrentlySelectedPrompt,
} from "./chat/promptUtils";
import { HEADER_SIZE_PX, RESIZE_HANDLE_SIZE_PX } from "./constants";
import {
  addToExplorerNodeMap,
  createPath,
  getDirectoryNode,
  getFileNode,
} from "./explorerUtils";
import { createEmptyFileInMemory, switchSelectedFile } from "./fileUtils";
import { updateMapKeys } from "./javascriptUtils";
import { defaultLayout, setLayoutInLocalStorage } from "./layoutUtils";

// Not sure if this is necessary.
enableMapSet();

export const getInitialState = (): MainState => {
  const explorerNodeMap = new Map<string, ExplorerNode>();

  const initialPromptTabs: PromptTab[] = [
    {
      selected: true,
      tabName: "Current Prompt",
    },

    {
      selected: false,
      tabName: "Prompt Source Code",
    },
    {
      selected: false,
      tabName: "Chat",
    },
  ];

  const initialFile = createEmptyFileInMemory(explorerNodeMap);
  // const selectedFileNodePath = initialFile.path;
  initialFile.selected = true; // exceptional case: the initial file is selected manually here.
  explorerNodeMap.set(initialFile.path, initialFile);

  return {
    settings: {
      editorSettings: {
        fontSize: 14,
        keyBindings: "default",
        theme: "github-dark",
      },
      openAIAPIKey: "",
      keyboardShortcuts: {
        "Save File": "ctrl+s",
        "Get Inline Suggestion": "ctrl+enter",
      },
    },
    explorerNodeMap,
    activeHeaderItems: {
      fileEditor: true,
      chat: true,
      terminal: false,
      explorer: false,
      mainMenu: false,
      settings: false,
    },
    fileEditor: {
      openFilePaths: [initialFile.path],
    },
    promptEditor: {
      allTabs: initialPromptTabs,
    },
    layout: defaultLayout,
    promptTemplateMap: defaultPromptTemplateMap,
    promptSuggestion: "",
    lastLLMResponse: "",
    chatState: {
      messages: [],
      charCount: 0,
      errorMessage: "",
      isLoadingMessage: false,
    },
  };
};

export const mainStateReducer = (
  draft: MainState,
  action: MainStateAction
): MainState => {
  switch (action.type) {
    case "OPEN_FILE": {
      const { newNode, fileEditor } = action.payload;

      addToExplorerNodeMap(draft.explorerNodeMap, newNode);
      const draftFileNode = getFileNode(draft.explorerNodeMap, newNode.path);

      switchSelectedFile(draft.explorerNodeMap, draftFileNode.path, fileEditor);

      draft.fileEditor.openFilePaths.push(draftFileNode.path);

      return draft;
    }

    case "DIRECTORY_CREATE_CHILDREN": {
      const { directoryChildrenToCreate, directoryClicked } = action.payload;

      // console.log(
      //   "original(draft.explorer.explorerNodeMap)",
      //   original(draft.explorer.explorerNodeMap)
      // );
      //

      for (const node of directoryChildrenToCreate) {
        if (draft.explorerNodeMap.has(node.path)) {
          console.log("node.path already in explorer node map:", node.path);
          continue;
        }

        draft.explorerNodeMap.set(node.path, node);
      }

      const draftDirectoryClicked = getDirectoryNode(
        draft.explorerNodeMap,
        directoryClicked.path
      );

      draftDirectoryClicked.expanded = true;
      draftDirectoryClicked.hasCreatedChildren = true;

      return draft;
    }

    case "DIRECTORY_TOGGLE_EXPANDED": {
      const { directoryClicked } = action.payload;

      const draftDirectoryClicked = getDirectoryNode(
        draft.explorerNodeMap,
        directoryClicked.path
      );

      draftDirectoryClicked.expanded = !draftDirectoryClicked.expanded;

      return draft;
    }

    // The SWITCH_FILE action assumes the new file to switch to exists in the explorerNodeMap.
    // However, the file may not have an associated tab yet.
    case "SWITCH_FILE": {
      const { fileNode, fileEditor } = action.payload;

      if (fileNode.selected && fileNode.openInTab) {
        console.log("fileNode already selected and open in tab");
        return draft;
      }

      const draftFileNode = getFileNode(draft.explorerNodeMap, fileNode.path);

      switchSelectedFile(draft.explorerNodeMap, draftFileNode.path, fileEditor);

      if (!draftFileNode.openInTab) {
        draft.fileEditor.openFilePaths.push(draftFileNode.path);
        draftFileNode.openInTab = true;
      }

      return draft;
    }

    case "OPEN_DIRECTORY": {
      const nodesInDirectory = action.payload;

      for (const node of nodesInDirectory) {
        addToExplorerNodeMap(draft.explorerNodeMap, node);
      }

      return draft;
    }

    case "CREATE_NEW_FILE": {
      const { newNode, fileEditor } = action.payload;

      if (!newNode.memoryOnlyFile) {
        throw new Error("CREATE_NEW_FILE - memoryOnlyFile is undefined");
      }

      addToExplorerNodeMap(draft.explorerNodeMap, newNode);

      switchSelectedFile(draft.explorerNodeMap, newNode.path, fileEditor);

      draft.fileEditor.openFilePaths.push(newNode.path);
      newNode.openInTab = true;

      return draft;
    }

    case "RESIZE_EDITORS_HORIZONTALLY": {
      const deltaY = action.payload.delta.y;
      const initialRowSize = action.payload.initialRowSize;
      // Row size (height) can't be smaller than 0.
      let resizableRowSize = Math.max(0, initialRowSize - deltaY);
      // Row size (height) can't be greater than 100vh - HEADER_SIZE_PX*2 - RESIZE_HANDLE_SIZE_PX:
      // The *2 is because there will be 2 headers above the row - the top header, and the prompt header.
      // FIXME: In mobile, window.innerHeight likely won't correspond to 100vh all the time. Not sure though.
      resizableRowSize = Math.min(
        window.innerHeight - HEADER_SIZE_PX * 2 - RESIZE_HANDLE_SIZE_PX,
        resizableRowSize
      );

      draft.layout.resizableRowSize = resizableRowSize;
      setLayoutInLocalStorage(draft.layout);

      // console.log("resizableRowSize", resizableRowSize);
      // console.log("deltaY", deltaY);

      return draft;
    }

    case "RESIZE_EDITORS_VERTICALLY": {
      const deltaX = action.payload.delta.x;
      const initialColSize = action.payload.initialColSize;
      // Col size (width) can't be smaller than 0.
      let resizableColSize = Math.max(0, initialColSize + deltaX);
      // Col size (width) can't be greater than 100vw.
      resizableColSize = Math.min(window.innerWidth, resizableColSize);

      draft.layout.resizableColSize = resizableColSize;

      setLayoutInLocalStorage(draft.layout);

      // console.log("resizableColSize", resizableColSize);
      // console.log("deltaX", deltaX);

      return draft;
    }

    case "CLOSE_FILE": {
      const { fileNode, fileEditor } = action.payload;

      if (draft.fileEditor.openFilePaths.length === 1) {
        console.log("Can't close last open file at the moment.");
        return draft;
      }

      const draftFileNode = getFileNode(draft.explorerNodeMap, fileNode.path);

      // Remove the closed tab file from the openFilePaths array.
      draft.fileEditor.openFilePaths = draft.fileEditor.openFilePaths.filter(
        (filePath) => filePath !== fileNode.path
      );

      draftFileNode.openInTab = false;

      // If the closed tab was the currently active tab - switch to another tab.
      if (draftFileNode.selected) {
        draftFileNode.selected = false;

        const filePathToSwitchTo = draft.fileEditor.openFilePaths.find(
          (filePath) => filePath !== fileNode.path
        );

        if (!filePathToSwitchTo) {
          throw new Error("CLOSE_FILE - filePathToSwitchTo is undefined");
        }

        switchSelectedFile(
          draft.explorerNodeMap,
          filePathToSwitchTo,
          fileEditor
        );
      }

      return draft;
    }

    case "UPDATE_FILE_IS_DIRTY": {
      const { fileNode, isDirty } = action.payload;

      const draftFileNode = getFileNode(draft.explorerNodeMap, fileNode.path);

      draftFileNode.isDirty = isDirty;

      return draft;
    }

    case "SAVE_FILE_AS": {
      const { fileNode, fileHandle } = action.payload;
      const oldPath = fileNode.path;

      const draftFileNode = getFileNode(draft.explorerNodeMap, fileNode.path);

      draftFileNode.fileHandle = fileHandle;
      draftFileNode.name = fileHandle.name;
      draftFileNode.isDirty = false;

      // FIXME: This won't work if users save file in a new directory.
      // A possible solution would be to refresh the explorer nodes.
      const newPath = createPath(
        fileHandle.name,
        draftFileNode.parentDirectoryPath,
        draft.explorerNodeMap
      );

      draftFileNode.path = newPath;

      draft.explorerNodeMap = updateMapKeys(
        draft.explorerNodeMap,
        oldPath,
        newPath
      );

      draft.fileEditor.openFilePaths = draft.fileEditor.openFilePaths.filter(
        (filePath) => filePath !== oldPath
      );

      draft.fileEditor.openFilePaths.push(newPath);

      return draft;
    }

    case "SAVE_FILE": {
      const { fileNode } = action.payload;

      const draftFileNode = getFileNode(draft.explorerNodeMap, fileNode.path);

      draftFileNode.isDirty = false;

      return draft;
    }

    case "SET_SELECTED_PROMPT": {
      const { promptName } = action.payload;

      // Deselect current prompt:
      const currentPrompt = getCurrentlySelectedPrompt(draft.promptTemplateMap);
      const newlySelectedPrompt = draft.promptTemplateMap.get(promptName);

      if (!newlySelectedPrompt) {
        throw new Error(
          "SET_SELECTED_PROMPT - newlySelectedPrompt is undefined"
        );
      }

      currentPrompt.selected = false;
      newlySelectedPrompt.selected = true;

      return draft;
    }

    case "SET_CHAT_PROMPT_SUGGESTION": {
      const promptSuggestion = action.payload;

      draft.promptSuggestion = promptSuggestion;

      return draft;
    }
    case "TOGGLE_MAIN_MENU": {
      draft.activeHeaderItems.mainMenu = !draft.activeHeaderItems.mainMenu;

      return draft;
    }

    case "TOGGLE_SETTINGS": {
      draft.activeHeaderItems.settings = !draft.activeHeaderItems.settings;

      return draft;
    }

    case "ACTIVATE_CHAT": {
      draft.activeHeaderItems.chat = true;
      draft.activeHeaderItems.explorer = false;

      return draft;
    }

    case "ACTIVATE_EXPLORER": {
      draft.activeHeaderItems.chat = false;
      draft.activeHeaderItems.explorer = true;

      return draft;
    }

    case "ACTIVATE_FILE_EDITOR": {
      draft.activeHeaderItems.fileEditor = true;
      draft.activeHeaderItems.terminal = false;

      return draft;
    }

    case "ACTIVATE_TERMINAL": {
      draft.activeHeaderItems.fileEditor = false;
      draft.activeHeaderItems.terminal = true;

      return draft;
    }

    case "SET_STATE_FROM_LOCAL_STORAGE": {
      const { layout } = action.payload;

      draft.layout = layout;

      return draft;
    }

    case "SET_OPENAI_API_KEY": {
      const openAIAPIKey = action.payload;

      draft.settings.openAIAPIKey = openAIAPIKey;

      return draft;
    }

    case "UPDATE_CHAT_STATE": {
      const {
        newMessage,
        isLoadingMessage,
        errorMessage,
        textAreaValue,
        abortController,
      } = action.payload;

      if (textAreaValue !== undefined) {
        draft.chatState.charCount = textAreaValue.length;
      }

      const lastMessageRole = draft.chatState.messages?.at(-1)?.role;

      if (lastMessageRole === "assistant" && newMessage?.role === "assistant") {
        if (newMessage !== undefined) {
          draft.chatState.messages[draft.chatState.messages.length - 1] =
            newMessage;

          // If a server message is done loading, set lastLLMResponse.
          if (!isLoadingMessage && !errorMessage) {
            draft.lastLLMResponse = newMessage.content;
          }
        }
      } else if (newMessage !== undefined) {
        draft.chatState.errorMessage = "";
        draft.chatState.messages.push(newMessage);
      }

      if (isLoadingMessage !== undefined) {
        draft.chatState.isLoadingMessage = isLoadingMessage;
      }

      if (errorMessage !== undefined) {
        draft.chatState.errorMessage = errorMessage;
      }

      if (abortController !== undefined) {
        draft.chatState.abortController = abortController;
      }

      return draft;
    }

    case "SET_KEY_BINDINGS": {
      const keyBindings = action.payload;

      draft.settings.editorSettings.keyBindings = keyBindings;

      return draft;
    }

    case "SET_KEYBOARD_SHORTCUT": {
      const { keyboardShortcutAction, keys } = action.payload;

      // Sanity check:
      if (!(keyboardShortcutAction in draft.settings.keyboardShortcuts)) {
        throw new Error(
          `SET_KEYBOARD_SHORTCUT - keyboardShortcutAction ${keyboardShortcutAction} not found`
        );
      }

      draft.settings.keyboardShortcuts[keyboardShortcutAction] = keys;

      return draft;
    }
  }

  // Default return value.
  return draft;
};
