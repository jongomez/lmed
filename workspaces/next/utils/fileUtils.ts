// Creating an "in-memory" file. This file won't exist on the disk until it's saved.

import type { FileNode, MainState } from "@/types/MainTypes";
import { Annotation, EditorState, TransactionSpec } from "@codemirror/state";
import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { getFileNode } from "./explorerUtils";

export const createEmptyFileInMemory = (
  explorerNodeMap: MainState["explorerNodeMap"]
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
    isDirty: false,
  };

  return emptyFile;
};

export const deselectAllFiles = (
  explorerNodeMap: MainState["explorerNodeMap"]
): void => {
  for (const [nodeKey, node] of explorerNodeMap) {
    if (node.type === "file") {
      node.selected = false;
    }
  }
};

export const SwitchToNewFileAnnotation = Annotation.define<string>();

// WARNING: This function mutates stuff. Should only be called with immer drafts.
export const switchSelectedFile = (
  explorerNodeMap: MainState["explorerNodeMap"],
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

  switchFromFile.selected = false;
  switchToFile.selected = true;

  // Store the current editor state for the currently open file.
  // This way, when you switch tabs back to this file, you'll see the same editor state.
  const currentlySelectedFileEditorState = fileEditor.view.state;
  switchFromFile.serializedEditorState =
    currentlySelectedFileEditorState.toJSON();

  if (!switchToFile.serializedEditorState) {
    if (!switchToFile.fileHandle) {
      // This should never happen - fileNodes without fileHandles should be in-memory files.
      // And in-memory files should always have serializedEditorState.
      throw new Error("switchSelectedFile - switchToFile.fileHandle is null");
    }

    // XXX: WARNING: This is an async operation. In a non async function. damn.
    switchToFile.fileHandle.getFile().then((file) => {
      file.text().then((contents) => {
        // The following breaks codemirror for some reason. will use .dispatch() instead.
        // const newState = EditorState.create({ doc: contents });
        // fileEditor.view!.setState(newState);

        const currentDocLength = fileEditor.view!.state.doc.length;
        let transaction: TransactionSpec = {
          changes: { from: 0, to: currentDocLength, insert: contents },
          annotations: SwitchToNewFileAnnotation.of("FIRST_TIME_OPENING_FILE"),
        };

        fileEditor.view!.dispatch(transaction);
      });
    });
  } else {
    // If the file already has a serializedEditorState, use that.
    // No need to fetch the file contents asynchronously.
    fileEditor.view.setState(
      EditorState.fromJSON(switchToFile.serializedEditorState)
    );
  }
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
  explorerNodeMap: MainState["explorerNodeMap"]
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

export const getCurrentlySelectedFilePath = (
  explorerNodeMap: MainState["explorerNodeMap"]
): string => {
  const currentlySelectedFile = getCurrentlySelectedFile(explorerNodeMap);
  return currentlySelectedFile.path;
};
