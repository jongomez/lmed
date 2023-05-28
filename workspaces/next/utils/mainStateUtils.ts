"use client";

import type {
  ExplorerNode,
  FileEditorTab,
  MainState,
  MainStateAction,
  PromptTab,
  RootNode,
} from "@/types/MainTypes";
import { HEADER_SIZE_PX, RESIZE_HANDLE_SIZE_PX } from "./constants";
import { createNewTab } from "./editorUtils";
import { createEmptyFileInMemory } from "./fileUtils";

export const getInitialState = (): MainState => {
  const explorerTreeRoot: RootNode = {
    id: 0,
    treeLength: 1,
    name: "root",
    type: "root",
    children: [],
  };

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
      tabName: "History",
    },
  ];

  const initialFileId = 1;
  const initialFile = createEmptyFileInMemory(initialFileId);

  explorerTreeRoot.children.push(initialFile);

  const initialTab: FileEditorTab = {
    fileNode: initialFile,
    selected: true,
    value: ["", ""],
    language: "markdown",
    hasDiff: false,
    markers: {},
  };

  return {
    iconTabIndex: 0,
    explorer: {
      explorerTreeRoot,
      selectedNode: initialFile,
      idCounter: 2,
    },
    fileEditor: {
      currentTab: initialTab,
      allTabs: [initialTab],
    },
    globalEditorSettings: {
      fontSize: 14,
      theme: "github-dark",
    },
    promptEditor: {
      currentTab: initialPromptTabs[0],
      allTabs: initialPromptTabs,
    },
    layout: {
      adjustableRowSize: 200,
      verticalHandlePosition: 0,
    },
    isMainMenuOpen: false,
  };
};

const findNodeInTree = (
  node: ExplorerNode,
  nodeId: number
): ExplorerNode | null => {
  if (node.id === nodeId) {
    return node;
  }

  if (node.type === "directory" || node.type === "root") {
    for (let child of node.children) {
      let found = findNodeInTree(child, nodeId);

      if (found) {
        return found;
      }
    }
  }

  return null;
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
      draft.explorer.selectedNode = action.payload;
      draft.explorer.explorerTreeRoot.children.push(action.payload);
      return draft;
    }

    case "EXPLORER_DIRECTORY_CLICK": {
      // TODO: Check if the action.payload object is the same as the one fetched from the draft tree root.
      const draftNode = findNodeInTree(
        draft.explorer.explorerTreeRoot,
        action.payload.id
      );

      if (!draftNode) {
        throw new Error("Could not find directory node in tree");
      }

      if (draftNode.type !== "directory") {
        throw new Error("Node is not a directory");
      }

      // TODO: Check immer patches for this.
      console.log("draftNode === action.payload", draftNode === action.payload);
      console.log("draftNode", draftNode);
      console.log("action.payload", action.payload);
      debugger;

      draftNode.expanded = !draftNode.expanded;
      // draft.explorer.selectedNode = action.payload;
      return draft;
    }

    case "EXPLORER_FILE_CLICK": {
      const { fileNode, file, contents } = action.payload;

      const draftNode = findNodeInTree(
        draft.explorer.explorerTreeRoot,
        fileNode.id
      );

      // TODO: Check immer patches for this.
      console.log("draftNode === fileNode", draftNode === fileNode);
      console.log("draftNode", draftNode);
      console.log("fileNode", fileNode);
      debugger;

      if (!draftNode) {
        throw new Error("Could not find file node in tree");
      }

      if (draftNode.type !== "file") {
        throw new Error("Node is not a file");
      }

      draftNode.selected = true;

      // Check to see if a tab is already open for this file.
      let currentTab = draft.fileEditor.allTabs.find(
        (tab) => tab.fileNode.id === draftNode.id
      );

      // If the tab is not found (i.e. the file is not open in any tab), create a new tab.
      if (!currentTab) {
        currentTab = createNewTab(draftNode, file, contents);
        draft.fileEditor.allTabs.push(currentTab);
      }

      draft.fileEditor.currentTab = currentTab;
      draft.explorer.selectedNode = draftNode;

      return draft;
    }

    case "OPEN_DIRECTORY": {
      draft.explorer.explorerTreeRoot = action.payload;
      return draft;
    }

    case "CREATE_NEW_FILE": {
      const newFileNode = action.payload;
      draft.explorer.selectedNode = newFileNode;
      draft.explorer.explorerTreeRoot.children.push(newFileNode);

      if (!newFileNode.file) {
        throw new Error("CREATE_NEW_FILE - file is undefined");
      }

      // Handle tabs - create a new tab for the new file, and select that tab.
      const currentTab = createNewTab(newFileNode, newFileNode.file, "");
      draft.fileEditor.allTabs.push(currentTab);
      draft.fileEditor.currentTab = currentTab;

      return draft;
    }

    case "SET_CURRENT_FILE_TAB": {
      draft.fileEditor.currentTab = action.payload;
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

    case "RESIZE_EXPLORER_HORIZONTALLY": {
      const deltaY = action.payload.delta.y;
      const initialRowSize = action.payload.initialRowSize;
      // Row size (height) can't be smaller than 0.
      let adjustableRowSize = Math.max(0, initialRowSize - deltaY);
      // Row size (height) can't be greater than 100vh - HEADER_SIZE_PX*2 - RESIZE_HANDLE_SIZE_PX:
      // The *2 is because there will be 2 headers above the row - the top header, and the prompt header.
      // TODO: In mobile, window.innerHeight likely won't correspond to 100vh all the time. Not sure though.
      adjustableRowSize = Math.min(
        window.innerHeight - HEADER_SIZE_PX * 2 - RESIZE_HANDLE_SIZE_PX,
        adjustableRowSize
      );

      draft.layout.adjustableRowSize = adjustableRowSize;

      console.log("adjustableRowSize", adjustableRowSize);
      console.log("deltaY", deltaY);

      return draft;
    }

    // case "RESIZE_EXPLORER_VERTICALLY": {
    //   const { clientY } = action.payload;
    //   const containerHeight = document.documentElement.clientHeight;
    //   const newPosition = (clientY / containerHeight) * 100;
    //   draft.layout.verticalHandlePosition = newPosition;
    //   return draft;
    // }
  }

  // Default return value.
  return draft;
};
