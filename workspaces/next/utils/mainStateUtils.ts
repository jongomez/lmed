"use client";

import type {
  EditorTab,
  ExplorerNode,
  FileNode,
  MainState,
  MainStateAction,
  RootNode,
} from "@/types/MainTypes";
import { createNewTab } from "./editorUtils";

export const getInitialState = (): MainState => {
  const explorerTreeRoot: RootNode = {
    id: 0,
    treeLength: 1,
    name: "root",
    type: "root",
    children: [],
  };

  const initialFile: FileNode = {
    id: 1,
    name: "New File 1",
    type: "file",
    selected: true,
    parentNode: explorerTreeRoot,
  };

  explorerTreeRoot.children.push(initialFile);

  const initialTab: EditorTab = {
    fileNode: initialFile,
    selected: true,
    value: ["", ""],
    language: "markdown",
    hasDiff: false,
    markers: {},
  };

  return {
    socket: undefined,
    tabIndex: 0,
    explorer: {
      explorerTreeRoot,
      selectedNode: initialFile,
      idCounter: 2,
    },
    editor: {
      currentTab: initialTab,
      allTabs: [initialTab],
      fontSize: 14,
      diffEditorRef: null,
      theme: "github-dark",
    },
    mainTab: 0,
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
    case "SET_SOCKET": {
      draft.socket = action.payload;
      return draft;
    }

    case "SET_MAIN_TAB": {
      draft.mainTab = action.payload;
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

      if (!draftNode) {
        throw new Error("Could not find file node in tree");
      }

      if (draftNode.type !== "file") {
        throw new Error("Node is not a file");
      }

      draftNode.selected = true;

      let currentTab = draft.editor.allTabs.find(
        (tab) => tab.fileNode.id === draftNode.id
      );

      if (!currentTab) {
        currentTab = createNewTab(draftNode, file as File, contents);
        draft.editor.allTabs.push(currentTab);
      }

      draft.editor.currentTab = currentTab;
      draft.explorer.selectedNode = draftNode;

      return draft;
    }

    case "OPEN_DIRECTORY": {
      draft.explorer.explorerTreeRoot = action.payload;
      return draft;
    }

    case "CREATE_NEW_FILE": {
      draft.explorer.explorerTreeRoot.children.push(action.payload);
      draft.explorer.selectedNode = action.payload;
      return draft;
    }
  }
};