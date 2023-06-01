"use client";

import type {
  FileEditorTab,
  MainState,
  MainStateAction,
  PromptTab,
} from "@/types/MainTypes";
import { HEADER_SIZE_PX, RESIZE_HANDLE_SIZE_PX } from "./constants";
import {
  addToExplorerNodeMap,
  getDirectoryNode,
  getFileNode,
} from "./explorerUtils";
import {
  createEmptyFileInMemory,
  getCurrentlySelectedFile,
  switchSelectedFile,
} from "./fileUtils";

export const getInitialState = (): MainState => {
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

  const initialFile = createEmptyFileInMemory();

  const initialTab: FileEditorTab = {
    fileNode: initialFile,
  };

  return {
    iconTabIndex: 0,
    explorer: {
      explorerNodeMap: {
        [initialFile.path]: initialFile,
      },
      idCounter: 2,
    },
    fileEditor: {
      fileEditorRef: null,
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
      const newFileNode = action.payload;
      addToExplorerNodeMap(draft.explorer.explorerNodeMap, newFileNode);

      return draft;
    }

    case "EXPLORER_DIRECTORY_CLICK": {
      const { nodesInDirectory, directoryClicked } = action.payload;

      for (const node of nodesInDirectory) {
        if (node.path in draft.explorer.explorerNodeMap) {
          console.log("node.path already in explorer node map:", node.path);
          continue;
        }

        draft.explorer.explorerNodeMap[node.path] = node;
      }

      const draftDirectoryClicked = getDirectoryNode(
        draft.explorer,
        directoryClicked.path
      );

      draftDirectoryClicked.expanded = !draftDirectoryClicked.expanded;

      return draft;
    }

    // The SWITCH_FILE action assumes the new file to switch to exists in the explorerNodeMap.
    // However, the file may not have an associated tab yet.
    case "SWITCH_FILE": {
      const { fileNode } = action.payload;

      if (fileNode.selected && fileNode.openInTab) {
        console.log("fileNode already selected and open in tab");
        return draft;
      }

      const draftNode = getFileNode(draft.explorer, fileNode.path);
      const currentlySelectedFile = getCurrentlySelectedFile(
        draft.explorer.explorerNodeMap
      );

      // TODO: Check immer patches for this.
      console.log("draftNode === fileNode", draftNode === fileNode);
      console.log("draftNode", draftNode);
      console.log("fileNode", fileNode);
      debugger;

      switchSelectedFile(
        currentlySelectedFile,
        fileNode,
        // original(draft.fileEditor.fileEditorRef)
        draft.fileEditor.fileEditorRef
      );

      if (!draftNode.openInTab) {
        draft.fileEditor.openFilePaths.push(draftNode.path);
      }

      return draft;
    }

    case "OPEN_DIRECTORY": {
      const nodesInDirectory = action.payload;

      for (const node of nodesInDirectory) {
        addToExplorerNodeMap(draft.explorer.explorerNodeMap, node);
      }

      return draft;
    }

    case "CREATE_NEW_FILE": {
      const newFileNode = action.payload;

      if (!newFileNode.memoryOnlyFile) {
        throw new Error("CREATE_NEW_FILE - memoryOnlyFile is undefined");
      }

      const currentlySelectedFile = getCurrentlySelectedFile(
        draft.explorer.explorerNodeMap
      );
      addToExplorerNodeMap(draft.explorer.explorerNodeMap, newFileNode);

      switchSelectedFile(
        currentlySelectedFile,
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
