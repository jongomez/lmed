"use client";

import type {
  FileEditorTab,
  MainState,
  MainStateAction,
  PromptTab,
  RootNode,
} from "@/types/MainTypes";
import { HEADER_SIZE_PX, RESIZE_HANDLE_SIZE_PX } from "./constants";
import { createNewTab } from "./editorUtils";
import {
  createEmptyFileInMemory,
  deselectAllFilesInTree,
  findNodeInTree,
  switchSelectedFile,
} from "./fileTreeUtils";

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
  };

  return {
    iconTabIndex: 0,
    explorer: {
      explorerTreeRoot,
      idCounter: 2,
    },
    fileEditor: {
      fileEditorRef: null,
      allTabs: [initialTab],
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

    // The SWITCH_FILE action assumes the new file to switch to exists in the tree.
    // However, the file may not have an associated tab yet.
    case "SWITCH_FILE": {
      const { fileNode } = action.payload;

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
        throw new Error("SWITCH_FILE - Could not find file node in tree");
      }

      if (draftNode.type !== "file") {
        throw new Error("SWITCH_FILE - Node is not a file");
      }

      draftNode.selected = true;

      // Check to see if a tab is already open for this file.
      let currentTab = draft.fileEditor.allTabs.find(
        (tab) => tab.fileNode.id === draftNode.id
      );

      // If the tab is not found (i.e. the file is not open in any tab) it means:
      // - the file is in the file explorer tree, but it is not open in any tab.
      if (!currentTab) {
        const newTab = createNewTab(draftNode);
        draft.fileEditor.allTabs.push(newTab);
      }

      switchSelectedFile(
        draft.fileEditor.allTabs,
        fileNode,
        // original(draft.fileEditor.fileEditorRef)
        draft.fileEditor.fileEditorRef
      );

      return draft;
    }

    case "OPEN_DIRECTORY": {
      draft.explorer.explorerTreeRoot = action.payload;
      return draft;
    }

    // The CREATE_NEW_FILE action will:
    // - Add the passed in fileNode as a child of the root node.
    // - Create a new tab for the file.
    case "CREATE_NEW_FILE": {
      const newFileNode = action.payload;

      if (!newFileNode.memoryOnlyFile) {
        throw new Error("CREATE_NEW_FILE - memoryOnlyFile is undefined");
      }

      deselectAllFilesInTree(draft.explorer.explorerTreeRoot);
      draft.explorer.explorerTreeRoot.children.push(newFileNode);

      const newTab = createNewTab(newFileNode);
      draft.fileEditor.allTabs.push(newTab);

      debugger;
      switchSelectedFile(
        draft.fileEditor.allTabs,
        newFileNode,
        // original(draft.fileEditor.fileEditorRef)
        draft.fileEditor.fileEditorRef
      );

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

    case "SET_FILE_EDITOR_REF": {
      debugger;
      draft.fileEditor.fileEditorRef = action.payload;

      return draft;
    }
  }

  // Default return value.
  return draft;
};
