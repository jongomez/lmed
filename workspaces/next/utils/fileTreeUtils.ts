// Creating an "in-memory" file. This file won't exist on the disk until it's saved.

import type {
  ExplorerNode,
  FileEditorTab,
  FileNode,
  RootNode,
} from "@/types/MainTypes";
import { EditorState } from "@codemirror/state";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

export const createEmptyFileInMemory = (
  id: number,
  fileName = "New File"
): FileNode => {
  const hasWindow = typeof window !== "undefined";
  const emptyFileContent = "hello world";
  const emptyFileEditorState = EditorState.create({ doc: emptyFileContent });

  const emptyFile: FileNode = {
    id,
    name: fileName,
    type: "file",
    selected: true,
    memoryOnlyFile: hasWindow
      ? new File([emptyFileContent], fileName, {
          type: "text/plain",
        })
      : undefined,
    editorState: emptyFileEditorState,
    language: "markdown",
  };

  return emptyFile;
};

export const findNodeInTree = (
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

export const getFileNodeFromTree = (
  treeRoot: RootNode,
  fileNodeId: number,
  extraErrorInfo: string
): FileNode => {
  const fileNode = findNodeInTree(treeRoot, fileNodeId);

  if (!fileNode) {
    throw new Error(
      `getFileNodeFromTree - fileNode is undefined - ${extraErrorInfo}`
    );
  }

  if (fileNode.type !== "file") {
    throw new Error(
      `getFileNodeFromTree - fileNode is undefined - ${extraErrorInfo}`
    );
  }

  return fileNode;
};

export const deselectAllFilesInTree = (node: ExplorerNode): void => {
  if (node.type === "file") {
    node.selected = false;
  } else if (node.type === "directory" || node.type === "root") {
    for (let child of node.children) {
      deselectAllFilesInTree(child);
    }
  }
};

// switchSelectedFile does the following:
// 1. Before switching files, it stores the current editor state for the currently open file.
// 2. It then updates the file editor's state with the new file's contents.
export const switchSelectedFile = (
  allTabs: FileEditorTab[],
  newFile: FileNode,
  fileEditorRef: ReactCodeMirrorRef | null | undefined
) => {
  debugger;
  if (!fileEditorRef) {
    throw new Error("switchSelectedFile - fileEditorRef is null");
  }

  if (!fileEditorRef.view) {
    throw new Error("switchSelectedFile - fileEditorRef.view is null");
  }

  const currentlySelectedFile = getSelectedFile(allTabs);
  // Store the current editor state for the currently open file.
  // This way, when users switch tabs back to this file, they'll see the same editor state.
  const currentlySelectedFileEditorState = fileEditorRef.view.state;
  currentlySelectedFile.editorState = currentlySelectedFileEditorState;

  // Update the file editor's state with the new file's contents.
  fileEditorRef.view.setState(newFile.editorState);
};

// The selected file has to be in a tab.
export const getSelectedFile = (allTabs: FileEditorTab[]): FileNode => {
  for (const tab of allTabs) {
    if (tab.fileNode.selected) {
      return tab.fileNode;
    }
  }

  throw new Error("No selected file found");
};

export const getCurrentEditorViewState = (
  fileEditorRef: ReactCodeMirrorRef | null
): EditorState => {
  const currentEditorState = fileEditorRef?.view?.state;

  if (!currentEditorState) {
    throw new Error("Could not get fileEditorRef?.view?.state");
  }

  return currentEditorState;
};
