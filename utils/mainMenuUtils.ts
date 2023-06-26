import type {
  ExplorerNode,
  FileNode,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { EditorState } from "@codemirror/state";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { getLanguageFromFileName } from "./editorUtils";
import {
  createDirectoryNode,
  createFileNode,
  createPath,
} from "./explorerUtils";
import {
  createEmptyFileInMemory,
  getCurrentEditorViewState,
  getCurrentlySelectedFile,
} from "./fileUtils";

// XXX: Move the below functions to a separate file.

export const openFile = async (
  mainStateDispatch: MainStateDispatch,
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>,
  explorerNodeMap: MainState["explorerNodeMap"]
) => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();
  const fileContent = await file.text();
  const editorStateForFile = EditorState.create({ doc: fileContent });

  // XXX: Check if file is already open. If yes, show a message.

  const newNode: FileNode = {
    name: file.name,
    type: "file",
    selected: false,
    language: getLanguageFromFileName(file.name),
    serializedEditorState: editorStateForFile.toJSON(),
    openInTab: true,
    path: createPath(file.name, undefined, explorerNodeMap),
    fileHandle,
    isDirty: false,
  };

  // File will be inserted as a child of the root.
  mainStateDispatch({
    type: "OPEN_FILE",
    payload: { newNode, fileEditor: fileEditorRef.current },
  });
};

// Opens a directory from a user's local file system. This function does the following:
// 1. Opens a directory picker
// 2. Creates an explorer tree from the selected directory
export const openDirectory = async (
  mainStateDispatch: MainStateDispatch,
  explorerNodeMap: MainState["explorerNodeMap"]
) => {
  const dirHandle = await window.showDirectoryPicker();
  const parentDirectoryNode = createDirectoryNode(
    dirHandle,
    undefined,
    explorerNodeMap
  );
  parentDirectoryNode.expanded = true;
  // If the code is working correctly, having hasCreatedChildren to false should
  // not cause any issues - like creating the same files / directories multiple times.
  parentDirectoryNode.hasCreatedChildren = true;

  const nodesToCreate: ExplorerNode[] = [parentDirectoryNode];

  for await (const entry of dirHandle.values()) {
    // console.log("entry.name", entry.name);
    // console.log("dirHandle.name", dirHandle.name);
    if (entry.kind === "directory") {
      const directoryNode = createDirectoryNode(
        entry,
        parentDirectoryNode.path,
        explorerNodeMap
      );
      nodesToCreate.push(directoryNode);
    } else {
      const fileNode = createFileNode(
        entry,
        parentDirectoryNode.path,
        explorerNodeMap
      );
      nodesToCreate.push(fileNode);
    }
  }

  mainStateDispatch({ type: "OPEN_DIRECTORY", payload: nodesToCreate });
};

export const saveFile = async (
  mainStateDispatch: MainStateDispatch,
  explorerNodeMap: MainState["explorerNodeMap"],
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>
) => {
  const selectedFileNode = getCurrentlySelectedFile(explorerNodeMap);

  const currentEditorViewState = getCurrentEditorViewState(
    fileEditorRef.current
  );

  const fileHandle = selectedFileNode.fileHandle;

  // If there's no fileHandle, call saveFileAs to save the file with a new name.
  if (!fileHandle) {
    saveFileAs(mainStateDispatch, explorerNodeMap, fileEditorRef);

    return;
  }

  const writable = await fileHandle.createWritable();
  await writable.write(currentEditorViewState.doc.toString());
  await writable.close();

  if (selectedFileNode.isDirty) {
    mainStateDispatch({
      type: "SAVE_FILE",
      payload: { fileNode: selectedFileNode },
    });
  }
};

export const saveFileAs = async (
  mainStateDispatch: MainStateDispatch,
  explorerNodeMap: MainState["explorerNodeMap"],
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>
) => {
  const selectedFileNode = getCurrentlySelectedFile(explorerNodeMap);

  const currentEditorViewState = getCurrentEditorViewState(
    fileEditorRef.current
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

    if (selectedFileNode.isDirty) {
      mainStateDispatch({
        type: "UPDATE_FILE_IS_DIRTY",
        payload: { fileNode: selectedFileNode, isDirty: false },
      });
    }

    return;
  }

  let fileHandle;

  try {
    // Show a file save dialog and update fileHandle with the user-selected file.
    fileHandle = await window.showSaveFilePicker();
  } catch (err) {
    console.error("File save was cancelled by the user.");
    return; // Return here if the user cancelled the file save.
  }

  const writable = await fileHandle.createWritable();
  await writable.write(currentEditorViewState.doc.toString());
  await writable.close();

  // Update the selected file node with it's new fileHandle.
  mainStateDispatch({
    type: "SAVE_FILE_AS",
    payload: { fileNode: selectedFileNode, fileHandle },
  });
};

export const createNewFile = async (
  mainStateDispatch: MainStateDispatch,
  explorerNodeMap: MainState["explorerNodeMap"],
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>
) => {
  const newNode = createEmptyFileInMemory(explorerNodeMap);

  mainStateDispatch({
    type: "CREATE_NEW_FILE",
    payload: { newNode, fileEditor: fileEditorRef.current },
  });
};
