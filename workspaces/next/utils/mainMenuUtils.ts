import type {
  ExplorerNode,
  ExplorerState,
  FileEditorState,
  FileNode,
  MainStateDispatch,
} from "@/types/MainTypes";
import { EditorState } from "@codemirror/state";
import { getLanguageFromFileName } from "./editorUtils";
import { createDirectoryNode, createFileNode, getPath } from "./explorerUtils";
import {
  createEmptyFileInMemory,
  getCurrentEditorViewState,
  getCurrentlySelectedFile,
} from "./fileUtils";

// XXX: Move the below functions to a separate file.

export const openFile = async (mainStateDispatch: MainStateDispatch) => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const fileContent = await file.text();
  const editorStateForFile = EditorState.create({ doc: fileContent });

  // XXX: Check if file is already open. If yes, show a message.

  const newNode: FileNode = {
    name: file.name,
    type: "file",
    selected: true,
    language: getLanguageFromFileName(file.name),
    editorState: editorStateForFile,
    openInTab: false,
    path: getPath(file.name),
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
  explorerNodeMap: ExplorerState["explorerNodeMap"]
) => {
  const dirHandle = await window.showDirectoryPicker();
  const parentDirectoryNode = createDirectoryNode(dirHandle);
  const nodesToCreate: ExplorerNode[] = [parentDirectoryNode];

  for await (const entry of dirHandle.values()) {
    if (entry.kind === "directory") {
      const directoryNode = createDirectoryNode(entry);
      nodesToCreate.push(directoryNode);
    } else {
      const fileNode = createFileNode(entry, parentDirectoryNode);
      nodesToCreate.push(fileNode);
    }
  }

  mainStateDispatch({ type: "OPEN_DIRECTORY", payload: nodesToCreate });
};

export const saveFile = async (
  mainStateDispatch: MainStateDispatch,
  explorerState: ExplorerState,
  fileEditorState: FileEditorState
) => {
  const selectedFileNode = getCurrentlySelectedFile(
    explorerState.explorerNodeMap
  );

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
  const selectedFileNode = getCurrentlySelectedFile(
    explorerState.explorerNodeMap
  );

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
  const newNode = createEmptyFileInMemory();
  mainStateDispatch({ type: "CREATE_NEW_FILE", payload: newNode });
};
