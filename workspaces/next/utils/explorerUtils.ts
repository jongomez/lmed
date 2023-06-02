import type {
  DirectoryNode,
  ExplorerNode,
  ExplorerState,
  FileNode,
  MainStateDispatch,
} from "@/types/MainTypes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { getLanguageFromFileName } from "./editorUtils";

export const createFileNode = (
  fileHandle: FileSystemFileHandle,
  parentDirectory?: DirectoryNode
): FileNode => {
  return {
    fileHandle,
    parentDirectory,
    name: fileHandle.name,
    type: "file",
    selected: false,
    language: getLanguageFromFileName(fileHandle.name),
    openInTab: false,
    path: getPath(fileHandle.name, parentDirectory),
  };
};

export const createDirectoryNode = (
  directoryHandle: FileSystemDirectoryHandle,
  parentDirectory: DirectoryNode | undefined
): DirectoryNode => {
  return {
    directoryHandle,
    parentDirectory,
    path: getPath(directoryHandle.name, parentDirectory),
    name: directoryHandle.name,
    type: "directory",
    expanded: false,
    hasCreatedChildren: false,
  };
};

export const getPath = (
  currentName: string,
  parentDirectoryNode: DirectoryNode | undefined
): string => {
  if (parentDirectoryNode) {
    return `${getPath(
      parentDirectoryNode.name,
      parentDirectoryNode.parentDirectory
    )}/${currentName}`;
  }

  return currentName;
};

export const handleFileClick = async (
  fileNode: FileNode,
  mainStateDispatch: MainStateDispatch,
  fileEditor: ReactCodeMirrorRef
) => {
  let file: File;
  if (fileNode.fileHandle) {
    file = await fileNode.fileHandle.getFile();
  } else if (fileNode.memoryOnlyFile) {
    file = fileNode.memoryOnlyFile;
  } else {
    throw new Error("No fileHandle or fileNode.file found :(");
  }

  const contents = await file.text();

  // Update state in a function to access prevState
  mainStateDispatch({
    type: "SWITCH_FILE",
    payload: { fileNode, fileEditor },
  });
};

export const handleDirectoryClick = async (
  directoryClicked: DirectoryNode,
  mainStateDispatch: MainStateDispatch
) => {
  const directoryChildrenToCreate: ExplorerNode[] = [];

  if (directoryClicked.hasCreatedChildren) {
    mainStateDispatch({
      type: "DIRECTORY_TOGGLE_EXPANDED",
      payload: { directoryClicked },
    });

    return;
  }

  for await (const entry of directoryClicked.directoryHandle.values()) {
    if (entry.kind === "directory") {
      const directoryNode = createDirectoryNode(entry, directoryClicked);
      directoryChildrenToCreate.push(directoryNode);
    } else {
      const fileNode = createFileNode(entry, directoryClicked);
      directoryChildrenToCreate.push(fileNode);
    }
  }

  mainStateDispatch({
    type: "DIRECTORY_CREATE_CHILDREN",
    payload: { directoryChildrenToCreate, directoryClicked },
  });
};

export const addToExplorerNodeMap = (
  explorerNodeMap: ExplorerState["explorerNodeMap"],
  node: ExplorerNode
) => {
  if (explorerNodeMap.has(node.path)) {
    throw new Error(
      "Node already exists in explorerNodeMap. Node path: " + node.path
    );
  }

  explorerNodeMap.set(node.path, node);
};

export const getDirectoryNode = (
  explorerState: ExplorerState,
  directoryPath: string
): DirectoryNode => {
  const directoryNode = explorerState.explorerNodeMap.get(directoryPath);

  if (!directoryNode) {
    throw new Error("Directory node not found in explorerNodeMap");
  }

  if (directoryNode.type !== "directory") {
    throw new Error(
      "Node is not a directory. Node path: " + directoryNode.path
    );
  }

  return directoryNode;
};

export const getFileNode = (
  explorerNodeMap: ExplorerState["explorerNodeMap"],
  filePath: string
): FileNode => {
  const fileNode = explorerNodeMap.get(filePath);

  if (!fileNode) {
    throw new Error("File node not found in explorerNodeMap");
  }

  if (fileNode.type !== "file") {
    throw new Error("Node is not a file. Node path: " + fileNode.path);
  }

  return fileNode;
};
