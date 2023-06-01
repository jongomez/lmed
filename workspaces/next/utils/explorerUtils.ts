import type {
  DirectoryNode,
  ExplorerNode,
  ExplorerState,
  FileNode,
  MainStateDispatch,
} from "@/types/MainTypes";
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
    path: getPath(fileHandle.name),
  };
};

export const createDirectoryNode = (
  directoryHandle: FileSystemDirectoryHandle,
  parentDirectory?: DirectoryNode
): DirectoryNode => {
  return {
    directoryHandle,
    parentDirectory,
    path: getPath(directoryHandle.name),
    name: directoryHandle.name,
    type: "directory",
    expanded: false,
  };
};

export const getPath = (
  currentName: string,
  parentDirectoryNode?: DirectoryNode
): string => {
  // TODO:

  return currentName;
};

export const handleFileClick = async (
  fileNode: FileNode,
  mainStateDispatch: MainStateDispatch
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
    payload: { fileNode },
  });
};

export const handleDirectoryClick = async (
  directoryClicked: DirectoryNode,
  mainStateDispatch: MainStateDispatch
) => {
  const nodesInDirectory: ExplorerNode[] = [];

  if (directoryClicked.expanded) {
    mainStateDispatch({
      type: "EXPLORER_DIRECTORY_CLICK",
      payload: { nodesInDirectory, directoryClicked },
    });
  }

  for await (const entry of directoryClicked.directoryHandle.values()) {
    if (entry.kind === "directory") {
      const directoryNode = createDirectoryNode(entry);
      nodesInDirectory.push(directoryNode);
    } else {
      const fileNode = createFileNode(entry, directoryClicked);
      nodesInDirectory.push(fileNode);
    }
  }

  mainStateDispatch({
    type: "EXPLORER_DIRECTORY_CLICK",
    payload: { nodesInDirectory, directoryClicked },
  });
};

export const addToExplorerNodeMap = (
  explorerNodeMap: ExplorerState["explorerNodeMap"],
  node: ExplorerNode
) => {
  if (node.name in explorerNodeMap) {
    throw new Error(
      "Node already exists in explorerNodeMap. Node name: " + node.name
    );
  }

  explorerNodeMap[node.name] = node;
};

export const getDirectoryNode = (
  explorerState: ExplorerState,
  directoryPath: string
): DirectoryNode => {
  const directoryNode = explorerState.explorerNodeMap[directoryPath];

  if (!directoryNode) {
    throw new Error("Directory node not found in explorerNodeMap");
  }

  if (directoryNode.type !== "directory") {
    throw new Error(
      "Node is not a directory. Node name: " + directoryNode.name
    );
  }

  return directoryNode;
};

export const getFileNode = (
  explorerState: ExplorerState,
  filePath: string
): FileNode => {
  const fileNode = explorerState.explorerNodeMap[filePath];

  if (!fileNode) {
    throw new Error("File node not found in explorerNodeMap");
  }

  if (fileNode.type !== "file") {
    throw new Error("Node is not a file. Node name: " + fileNode.name);
  }

  return fileNode;
};
