import type {
  ExplorerState,
  FileEditorState,
  FileNode,
  MainStateDispatch,
} from "@/types/MainTypes";
import { EditorState } from "@codemirror/state";
import { getLanguageFromFileName } from "./editorUtils";
import { createExplorerTree } from "./explorerUtils";
import {
  createEmptyFileInMemory,
  getCurrentEditorViewState,
  getSelectedFile,
} from "./fileTreeUtils";

// XXX: Move the below functions to a separate file.

export const openFile = async (
  mainStateDispatch: MainStateDispatch,
  explorer: ExplorerState
) => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const fileContent = await file.text();
  const editorStateForFile = EditorState.create({ doc: fileContent });

  // XXX: Check if file is already open. If yes, show a message.

  const newNode: FileNode = {
    id: explorer.explorerTreeRoot.treeLength + 1, // use treeLength to determine id
    name: file.name,
    type: "file",
    selected: true,
    language: getLanguageFromFileName(file.name),
    editorState: editorStateForFile,
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
  fileEditorState: FileEditorState
) => {
  const selectedFileNode = getSelectedFile(fileEditorState.allTabs);

  const currentEditorViewState = getCurrentEditorViewState(
    fileEditorState.fileEditorRef
  );

  const fileHandle = selectedFileNode.fileHandle;

  // If there's no fileHandle, call saveFileAs to save the file with a new name.
  if (!fileHandle) {
    saveFileAs(mainStateDispatch, explorerState, fileEditorState);
    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(currentEditorViewState.doc.toString());
  await writable.close();
};

export const saveFileAs = async (
  mainStateDispatch: MainStateDispatch,
  explorerState: ExplorerState,
  fileEditorState: FileEditorState
) => {
  const selectedFileNode = getSelectedFile(fileEditorState.allTabs);

  const currentEditorViewState = getCurrentEditorViewState(
    fileEditorState.fileEditorRef
  );

  if (!("showSaveFilePicker" in window)) {
    const a = document.createElement("a");
    const file = new Blob([currentEditorViewState.doc.toString()], {
      type: "text/plain",
    });
    a.href = URL.createObjectURL(file);
    a.download = selectedFileNode.name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  // Show a file save dialog and update fileHandle with the user-selected file.
  const fileHandle = await window.showSaveFilePicker();

  const writable = await fileHandle.createWritable();
  await writable.write(currentEditorViewState.doc.toString());
  await writable.close();

  // Update state with the new fileHandle.

  selectedFileNode.fileHandle = fileHandle;
};

export const createNewFile = async (
  mainStateDispatch: MainStateDispatch,
  explorerState: ExplorerState,
  fileEditorState: FileEditorState
) => {
  const newNodeId = explorerState.explorerTreeRoot.treeLength + 1;
  const newNode = createEmptyFileInMemory(newNodeId);
  mainStateDispatch({ type: "CREATE_NEW_FILE", payload: newNode });
};
