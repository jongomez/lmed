import type {
  EditorState,
  ExplorerState,
  FileNode,
  MainState,
  SetMainState,
} from "@/types/Main";
import { createExplorerTree } from "./explorerUtils";

// XXX: Move the below functions to a separate file.

export const openFile = async (
  setMainState: SetMainState,
  explorer: ExplorerState
) => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();

  // XXX: Check if file is already open. If yes, show a message.

  const newNode: FileNode = {
    id: explorer.explorerTreeRoot.treeLength + 1, // use treeLength to determine id
    name: file.name,
    type: "file",
    selected: true,
    parentNode: explorer.explorerTreeRoot,
    fileHandle,
  };

  // File will be inserted as a child of the root.
  setMainState(
    (prevState): MainState => ({
      ...prevState,
      explorer: {
        ...prevState.explorer,
        explorerTreeRoot: {
          ...prevState.explorer.explorerTreeRoot,
          children: [
            ...(prevState.explorer.explorerTreeRoot.children || []),
            newNode,
          ],
        },
        selectedNode: newNode,
      },
    })
  );
};

// Opens a directory from a user's local file system. This function does the following:
// 1. Opens a directory picker
// 2. Creates an explorer tree from the selected directory
export const openDirectory = async (
  setMainState: SetMainState,
  explorerState: ExplorerState
) => {
  const dirHandle = await window.showDirectoryPicker();

  // XXX: Check if folder is already open. If yes, show a message.

  const explorerTreeRoot = await createExplorerTree(
    explorerState.explorerTreeRoot,
    explorerState.explorerTreeRoot,
    dirHandle
  );

  setMainState(
    (prevState): MainState => ({
      ...prevState,
      explorer: {
        ...prevState.explorer,
        explorerTreeRoot,
      },
    })
  );
};

export const saveFile = async (
  setMainState: SetMainState,
  explorerState: ExplorerState,
  editorState: EditorState
) => {
  if (!editorState.currentTab.fileNode) {
    throw new Error("No currentTab found :(");
  }

  let fileHandle = editorState.currentTab.fileNode.fileHandle;

  // If there's no fileHandle, call saveFileAs to save the file with a new name.
  if (!fileHandle) {
    saveFileAs(setMainState, explorerState, editorState);
    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(editorState.currentTab.value.join("\n"));
  await writable.close();
};

export const saveFileAs = async (
  setMainState: SetMainState,
  explorerState: ExplorerState,
  editorState: EditorState
) => {
  if (!editorState.currentTab.fileNode) {
    throw new Error("No currentTab found :(");
  }

  if (!("showSaveFilePicker" in window)) {
    const a = document.createElement("a");
    const file = new Blob([editorState.currentTab.value.join("\n")], {
      type: "text/plain",
    });
    a.href = URL.createObjectURL(file);
    a.download = editorState.currentTab.fileNode.name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Show a file save dialog and update fileHandle with the user-selected file.
  const fileHandle = await window.showSaveFilePicker();

  const writable = await fileHandle.createWritable();
  await writable.write(editorState.currentTab.value.join("\n"));
  await writable.close();

  // Update state with the new fileHandle.

  editorState.currentTab.fileNode.fileHandle = fileHandle;
};

export const createNewFile = async (
  setMainState: SetMainState,
  explorerState: ExplorerState,
  editorState: EditorState
) => {
  // Creating an "in-memory" file. This file won't exist on the disk until it's saved.
  const newNode: FileNode = {
    id: explorerState.explorerTreeRoot.treeLength + 1,
    name: "Untitled.txt",
    type: "file",
    selected: true,
    parentNode: explorerState.explorerTreeRoot,
    file: new Blob([""], { type: "text/plain" }),
  };

  // Add the new file to the explorer tree
  setMainState(
    (prevState): MainState => ({
      ...prevState,
      explorer: {
        ...prevState.explorer,
        explorerTreeRoot: {
          ...prevState.explorer.explorerTreeRoot,
          children: [
            ...(prevState.explorer.explorerTreeRoot.children || []),
            newNode,
          ],
        },
        selectedNode: newNode,
      },
    })
  );
};
