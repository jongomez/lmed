// Creating an "in-memory" file. This file won't exist on the disk until it's saved.

import type { ExplorerState, FileNode } from "@/types/MainTypes";
import { EditorState } from "@codemirror/state";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { getPath } from "./explorerUtils";

export const createEmptyFileInMemory = (fileName = "New File"): FileNode => {
  const hasWindow = typeof window !== "undefined";
  const emptyFileContent = "hello world";
  const emptyFileEditorState = EditorState.create({ doc: emptyFileContent });

  const emptyFile: FileNode = {
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
    openInTab: true,
    path: getPath(fileName),
  };

  return emptyFile;
};

export const deselectAllFiles = (
  explorerNodeMap: ExplorerState["explorerNodeMap"]
): void => {
  for (const node of Object.values(explorerNodeMap)) {
    if (node.type === "file") {
      node.selected = false;
    }
  }
};

// switchSelectedFile does the following:
// 1. Before switching files, it stores the current editor state for the currently open file.
// 2. It then updates the file editor's state with the new file's contents.
export const switchSelectedFile = (
  currentlySelectedFile: FileNode,
  newFileToSelect: FileNode,
  fileEditorRef: ReactCodeMirrorRef | null | undefined
) => {
  debugger;
  if (!fileEditorRef) {
    throw new Error("switchSelectedFile - fileEditorRef is null");
  }

  if (!fileEditorRef.view) {
    throw new Error("switchSelectedFile - fileEditorRef.view is null");
  }

  if (!newFileToSelect.editorState) {
    throw new Error("switchSelectedFile - newFileToSelect.editorState is null");
  }

  currentlySelectedFile.selected = false;
  newFileToSelect.selected = true;

  // Store the current editor state for the currently open file.
  // This way, when users switch tabs back to this file, they'll see the same editor state.
  const currentlySelectedFileEditorState = fileEditorRef.view.state;
  currentlySelectedFile.editorState = currentlySelectedFileEditorState;

  // Update the file editor's state with the new file's contents.
  fileEditorRef.view.setState(newFileToSelect.editorState);
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

export const getCurrentlySelectedFile = (
  explorerNodeMap: ExplorerState["explorerNodeMap"]
): FileNode => {
  let currentlySelectedFile: FileNode | undefined;

  console.log("HELLO!!");
  console.log("explorerNodeMap", explorerNodeMap);

  for (const node of Object.values(explorerNodeMap)) {
    if (node.type === "file" && node.selected) {
      currentlySelectedFile = node;
    }
  }

  if (!currentlySelectedFile) {
    throw new Error("No currently selected file found");
  }

  return currentlySelectedFile;
};
