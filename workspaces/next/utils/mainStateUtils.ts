"use client";

import type {
  ExplorerNode,
  MainState,
  MainStateAction,
  PromptTab,
} from "@/types/MainTypes";
import { enableMapSet } from "immer";
import { HEADER_SIZE_PX, RESIZE_HANDLE_SIZE_PX } from "./constants";
import {
  addToExplorerNodeMap,
  createPath,
  getDirectoryNode,
  getFileNode,
} from "./explorerUtils";
import { createEmptyFileInMemory, switchSelectedFile } from "./fileUtils";
import {
  defaultPromptTemplateMap,
  getCurrentlySelectedPrompt,
} from "./promptUtils";

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
    iconTabIndex: 0,
    explorerNodeMap,
    // selectedFileNodePath,
    fileEditor: {
      openFilePaths: [initialFile.path],
    },
    globalEditorSettings: {
      fontSize: 14,
      theme: "github-dark",
    },
    promptEditor: {
      allTabs: initialPromptTabs,
    },
    layout: {
      resizableRowSize: 200,
      resizableColSize: 200,
    },
    isMainMenuOpen: false,
    promptTemplateMap: defaultPromptTemplateMap,
    promptSuggestion: "",
  };
};

export const mainStateReducer = (
  draft: MainState,
  action: MainStateAction
): MainState => {
  switch (action.type) {
    case "SET_ICON_TAB": {
      draft.iconTabIndex = action.payload;
      return draft;
    }

    case "OPEN_FILE": {
      const { newNode, fileEditor } = action.payload;
      addToExplorerNodeMap(draft.explorerNodeMap, newNode);

      // TODO: Save current tab's editor state to the fileNode.

      return draft;
    }

    case "DIRECTORY_CREATE_CHILDREN": {
      const { directoryChildrenToCreate, directoryClicked } = action.payload;

      // console.log(
      //   "original(draft.explorer.explorerNodeMap)",
      //   original(draft.explorer.explorerNodeMap)
      // );
      // debugger;

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

      debugger;
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

    case "OPEN_MAIN_MENU": {
      draft.isMainMenuOpen = true;
      return draft;
    }

    case "CLOSE_MAIN_MENU": {
      draft.isMainMenuOpen = false;
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

      // console.log("resizableRowSize", resizableRowSize);
      // console.log("deltaY", deltaY);

      return draft;
    }

    case "RESIZE_EDITORS_VERTICALLY": {
      const deltaX = action.payload.delta.x;
      const initialColSize = action.payload.initialColSize;
      // Col size (width) can't be smaller than 0.
      let resizableColSize = Math.max(0, initialColSize + deltaX);
      // Col size (width) can't be greater than 100vh.
      resizableColSize = Math.min(window.innerHeight, resizableColSize);

      draft.layout.resizableColSize = resizableColSize;

      // console.log("resizableColSize", resizableColSize);
      // console.log("deltaX", deltaX);

      return draft;
    }

    case "CLOSE_FILE": {
      const { fileNode, fileEditor } = action.payload;

      // TODO:

      // Gotta check if file is dirty. Maybe check befor dispatching this action?

      return draft;
    }

    case "UPDATE_FILE_IS_DIRTY": {
      const { fileNode, isDirty } = action.payload;

      const draftFileNode = getFileNode(draft.explorerNodeMap, fileNode.path);

      draftFileNode.isDirty = isDirty;

      return draft;
    }

    case "SAVE_AS": {
      const { fileNode, fileHandle } = action.payload;

      const draftFileNode = getFileNode(draft.explorerNodeMap, fileNode.path);

      draftFileNode.fileHandle = fileHandle;
      draftFileNode.name = fileHandle.name;

      // FIXME: This won't work if users save file in a new directory.
      // A possible solution would be to refresh the explorer nodes.
      draftFileNode.path = createPath(
        fileHandle.name,
        draftFileNode.parentDirectoryPath,
        draft.explorerNodeMap
      );

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
  }

  // Default return value.
  return draft;
};
