// Creating an "in-memory" file. This file won't exist on the disk until it's saved.

import type { ExplorerState, FileNode } from "@/types/MainTypes";
import { EditorState } from "@codemirror/state";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { getFileNode } from "./explorerUtils";

export const createEmptyFileInMemory = (
  explorerNodeMap: ExplorerState["explorerNodeMap"]
): FileNode => {
  const hasWindow = typeof window !== "undefined";
  const emptyFileContent = "hello world";
  const emptyFileEditorState = EditorState.create({ doc: emptyFileContent });
  // Get unique new file name.
  let newFileNameIndex = 1;
  let fileName = `New File ${newFileNameIndex}`;

  // Here, we're assuming an in-memory file won't have a parent directory. So the path is just the file name.
  while (explorerNodeMap.has(fileName)) {
    newFileNameIndex += 1;
    fileName = `New File ${newFileNameIndex}`;
  }

  const emptyFile: FileNode = {
    name: fileName,
    type: "file",
    selected: false,
    memoryOnlyFile: hasWindow
      ? new File([emptyFileContent], fileName, {
          type: "text/plain",
        })
      : undefined,
    serializedEditorState: emptyFileEditorState.toJSON(),
    language: "markdown",
    openInTab: true,
    path: fileName,
  };

  return emptyFile;
};

export const deselectAllFiles = (
  explorerNodeMap: ExplorerState["explorerNodeMap"]
): void => {
  for (const [nodeKey, node] of explorerNodeMap) {
    if (node.type === "file") {
      node.selected = false;
    }
  }
};

// switchSelectedFile does the following:
// 1. Before switching files, it stores the current editor state for the currently open file.
// 2. It then updates the file editor's state with the new file's contents.
export const switchSelectedFile = (
  explorerNodeMap: ExplorerState["explorerNodeMap"],
  switchToFilePath: string,
  fileEditor: ReactCodeMirrorRef | null | undefined
) => {
  if (!fileEditor) {
    throw new Error("switchSelectedFile - fileEditor is null");
  }

  if (!fileEditor.view) {
    throw new Error("switchSelectedFile - fileEditor.view is null");
  }

  const switchFromFile = getCurrentlySelectedFile(explorerNodeMap);
  const switchToFile = getFileNode(explorerNodeMap, switchToFilePath);

  if (!switchToFile.serializedEditorState) {
    throw new Error(
      "switchSelectedFile - switchToFile.serializedEditorState is null"
    );
  }

  switchFromFile.selected = false;
  switchToFile.selected = true;

  // Store the current editor state for the currently open file.
  // This way, when users switch tabs back to this file, they'll see the same editor state.
  const currentlySelectedFileEditorState = fileEditor.view.state;
  switchFromFile.serializedEditorState =
    currentlySelectedFileEditorState.toJSON();

  // Update the file editor's state with the new file's contents.
  fileEditor.view.setState(
    EditorState.fromJSON(switchToFile.serializedEditorState)
  );

  // console.log(current(explorerNodeMap));
  // debugger;
};

export const getCurrentEditorViewState = (
  fileEditor: ReactCodeMirrorRef | null
): EditorState => {
  const currentEditorState = fileEditor?.view?.state;

  if (!currentEditorState) {
    throw new Error("Could not get fileEditor?.view?.state");
  }

  return currentEditorState;
};

export const getCurrentlySelectedFile = (
  explorerNodeMap: ExplorerState["explorerNodeMap"]
): FileNode => {
  let currentlySelectedFile: FileNode | undefined;
  let numberOrFilesSelected = 0;

  for (const [nodeKey, node] of explorerNodeMap) {
    if (node.type === "file" && node.selected) {
      numberOrFilesSelected++;
      currentlySelectedFile = node;
    }
  }

  if (numberOrFilesSelected != 1) {
    throw new Error(
      `Expected 1 file to be selected, but ${numberOrFilesSelected} were selected`
    );
  }

  if (!currentlySelectedFile) {
    throw new Error("currentlySelectedFile is falsy");
  }

  return currentlySelectedFile;
};
