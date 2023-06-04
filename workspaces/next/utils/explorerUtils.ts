import type {
  DirectoryNode,
  ExplorerNode,
  FileNode,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { getLanguageFromFileName } from "./editorUtils";

export const createFileNode = (
  fileHandle: FileSystemFileHandle,
  parentDirectoryPath: string | undefined,
  explorerNodeMap: MainState["explorerNodeMap"]
): FileNode => {
  return {
    fileHandle,
    parentDirectoryPath,
    name: fileHandle.name,
    type: "file",
    selected: false,
    language: getLanguageFromFileName(fileHandle.name),
    openInTab: false,
    path: createPath(fileHandle.name, parentDirectoryPath, explorerNodeMap),
    isDirty: false,
  };
};

export const createDirectoryNode = (
  directoryHandle: FileSystemDirectoryHandle,
  parentDirectoryPath: string | undefined,
  explorerNodeMap: MainState["explorerNodeMap"]
): DirectoryNode => {
  return {
    directoryHandle,
    parentDirectoryPath,
    path: createPath(
      directoryHandle.name,
      parentDirectoryPath,
      explorerNodeMap
    ),
    name: directoryHandle.name,
    type: "directory",
    expanded: false,
    hasCreatedChildren: false,
  };
};

export const createPath = (
  currentNodeName: string,
  parentPath: string | undefined,
  explorerNodeMap: MainState["explorerNodeMap"]
): string => {
  return parentPath ? parentPath + "/" + currentNodeName : currentNodeName;
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
  mainStateDispatch: MainStateDispatch,
  explorerNodeMap: MainState["explorerNodeMap"]
) => {
  const directoryChildrenToCreate: ExplorerNode[] = [];

  // If children have been loaded for the directory, simply toggle the expanded stat.:
  if (directoryClicked.hasCreatedChildren) {
    mainStateDispatch({
      type: "DIRECTORY_TOGGLE_EXPANDED",
      payload: { directoryClicked },
    });

    return;
  }

  // If children have not yet been loaded for the directory, do that here.
  for await (const entry of directoryClicked.directoryHandle.values()) {
    if (entry.kind === "directory") {
      const directoryNode = createDirectoryNode(
        entry,
        directoryClicked.path,
        explorerNodeMap
      );
      directoryChildrenToCreate.push(directoryNode);
    } else {
      const fileNode = createFileNode(
        entry,
        directoryClicked.path,
        explorerNodeMap
      );
      directoryChildrenToCreate.push(fileNode);
    }
  }

  mainStateDispatch({
    type: "DIRECTORY_CREATE_CHILDREN",
    payload: { directoryChildrenToCreate, directoryClicked },
  });
};

export const addToExplorerNodeMap = (
  explorerNodeMap: MainState["explorerNodeMap"],
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
  explorerNodeMap: MainState["explorerNodeMap"],
  directoryPath: string
): DirectoryNode => {
  const directoryNode = explorerNodeMap.get(directoryPath);

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
  explorerNodeMap: MainState["explorerNodeMap"],
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
