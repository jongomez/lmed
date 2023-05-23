import type {
  EditorState,
  ExplorerState,
  FileNode,
  MainStateDispatch,
} from "@/types/MainTypes";
import { createExplorerTree } from "./explorerUtils";
import { createEmptyFileInMemory } from "./fileUtils";

// XXX: Move the below functions to a separate file.

export const openFile = async (
  mainStateDispatch: MainStateDispatch,
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
  mainStateDispatch({ type: "OPEN_FILE", payload: newNode });
};

// Opens a directory from a user's local file system. This function does the following:
// 1. Opens a directory picker
// 2. Creates an explorer tree from the selected directory
export const openDirectory = async (
  mainStateDispatch: MainStateDispatch,
  explorerState: ExplorerState
) => {
  const dirHandle = await window.showDirectoryPicker();

  // XXX: Check if folder is already open. If yes, show a message.

  const explorerTreeRoot = await createExplorerTree(
    explorerState.explorerTreeRoot,
    explorerState.explorerTreeRoot,
    dirHandle
  );

  mainStateDispatch({ type: "OPEN_DIRECTORY", payload: explorerTreeRoot });
};

export const saveFile = async (
  mainStateDispatch: MainStateDispatch,
  explorerState: ExplorerState,
  editorState: EditorState
) => {
  if (!editorState.currentTab.fileNode) {
    throw new Error("No currentTab found :(");
  }

  let fileHandle = editorState.currentTab.fileNode.fileHandle;

  // If there's no fileHandle, call saveFileAs to save the file with a new name.
  if (!fileHandle) {
    saveFileAs(mainStateDispatch, explorerState, editorState);
    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(editorState.currentTab.value.join("\n"));
  await writable.close();
};

export const saveFileAs = async (
  mainStateDispatch: MainStateDispatch,
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
  mainStateDispatch: MainStateDispatch,
  explorerState: ExplorerState,
  editorState: EditorState
) => {
  const newNodeId = explorerState.explorerTreeRoot.treeLength + 1;
  const newNode = createEmptyFileInMemory(newNodeId);
  mainStateDispatch({ type: "CREATE_NEW_FILE", payload: newNode });
};
