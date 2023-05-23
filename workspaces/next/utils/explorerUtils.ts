import type {
  DirectoryNode,
  FileNode,
  MainStateDispatch,
  RootNode,
} from "@/types/MainTypes";

export const createFileNode = (
  id: number,
  fileHandle: FileSystemFileHandle,
  parentNode: RootNode | DirectoryNode
): FileNode => {
  return {
    id,
    fileHandle,
    name: fileHandle.name,
    type: "file",
    selected: false,
  };
};

export const createDirectoryNode = (
  id: number,
  directoryHandle: FileSystemDirectoryHandle,
  parentNode: RootNode | DirectoryNode
): DirectoryNode => {
  return {
    id,
    directoryHandle,
    name: directoryHandle.name,
    type: "directory",
    expanded: false,
    children: [],
  };
};

// Recursive function.
export const createExplorerTree = async (
  rootNode: RootNode,
  parentNode: RootNode | DirectoryNode,
  dirHandle: FileSystemDirectoryHandle
): Promise<RootNode> => {
  console.log("hello from createExplorerTree");
  // TODO: Handle case where directory is empty.

  for await (const entry of dirHandle.values()) {
    // FIXME: remove this mutation of the rootNode.
    rootNode.treeLength += 1;

    if (entry.kind === "directory") {
      const directoryNode = createDirectoryNode(
        rootNode.treeLength,
        entry,
        parentNode
      );
      parentNode.children.push(directoryNode);

      // Directory nodes may have children. Recursively add them to the tree.
      await createExplorerTree(rootNode, directoryNode, entry);
    } else {
      const fileNode = createFileNode(rootNode.treeLength, entry, parentNode);
      parentNode.children.push(fileNode);
    }
  }

  return rootNode;
};

/*

If a node in the tree changes and needs update, we need to:
1. replace the old node object with the new updated node object
2. the updated node's parent children array (with the newly updated node)

*/
/*
export const updateExplorerTreeNode = (
  oldNode: FileNode | DirectoryNode,
  newNode: FileNode | DirectoryNode
): void => {
  // Find the index of the oldNode in the parentNode's children array
  const index = oldNode.parentNode.children.findIndex(
    (child) => child.id === oldNode.id
  );

  if (index !== -1) {
    // Replace the old node with the new one
    oldNode.parentNode.children[index] = newNode;
  } else {
    throw new Error("Node not found in parent's children array");
  }
};
*/
export const handleFileClick = async (
  fileNode: FileNode,
  mainStateDispatch: MainStateDispatch
) => {
  let file: File;
  if (fileNode.fileHandle) {
    file = await fileNode.fileHandle.getFile();
  } else if (fileNode.file) {
    file = fileNode.file;
  } else {
    throw new Error("No fileHandle or fileNode.file found :(");
  }

  const contents = await file.text();

  // Update state in a function to access prevState
  mainStateDispatch({
    type: "EXPLORER_FILE_CLICK",
    payload: { fileNode, file, contents },
  });
};

export const handleDirectoryClick = async (
  directoryNode: DirectoryNode,
  mainStateDispatch: MainStateDispatch
) => {
  mainStateDispatch({
    type: "EXPLORER_DIRECTORY_CLICK",
    payload: directoryNode,
  });
};
