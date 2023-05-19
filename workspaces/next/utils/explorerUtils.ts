import type {
  ExplorerNode,
  ExplorerState,
  FileNode,
  FolderNode,
  MainState,
  RootNode,
  SetMainState,
} from "@/types/Main";
import { FileSystemDirectoryHandleAlias } from "@/types/global";

export const openFile = async (
  setMainState: SetMainState,
  explorer: ExplorerState
) => {
  const [fileHandle] = await window.showOpenFilePicker();
  const file = await fileHandle.getFile();

  const newNode: FileNode = {
    id: explorer.explorerTreeRoot.treeLength + 1, // use treeLength to determine id
    name: file.name,
    type: "file",
    selected: true,
    fileHandle,
  };

  // File will be inserted as a child of the root.
  setMainState((prevState) => ({
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
  }));
};

// Opens a folder from a user's local file system. This function does the following:
// 1. Opens a directory picker;
// 2. Creates an explorer tree from the selected directory;
export const openFolder = async (
  setMainState: SetMainState,
  explorerState: ExplorerState
) => {
  const dirHandle = await window.showDirectoryPicker();

  const explorerTreeRoot = await createExplorerTree(
    explorerState.explorerTreeRoot,
    explorerState.explorerTreeRoot,
    dirHandle
  );

  setMainState((prevState) => ({
    ...prevState,
    explorer: {
      ...prevState.explorer,
      explorerTreeRoot,
    },
  }));
};

const createFolderNode = () => {};

const createFileNode = (parentNode: RootNode | FolderNode) => {};

const createExplorerTree = async (
  rootNode: RootNode,
  parentNode: RootNode | FolderNode,
  dirHandle: FileSystemDirectoryHandleAlias
): Promise<ExplorerNode> => {
  for await (const entry of dirHandle.values()) {
    const newNode: ExplorerNode = {
      id: rootNode.treeLength + 1,
      name: entry.name,
      type: entry.kind,
      selected: false,
      expanded: false,
      children: [],
    };

    if (entry.kind === "directory") {
      (newNode as FolderNode).children.push(
        await createExplorerTree(rootNode, newNode as FolderNode, entry)
      );
    } else {
      newNode.fileHandle = entry;
    }

    if (parentNode.children) {
      parentNode.children.push(newNode);
    } else {
      parentNode.children = [newNode];
    }
  }

  return parentNode;
};

/*

updateExplorerTree is a recursive function that traverses the explorer tree and updates
the passed in node on the tree. A new root is returned if any changes were made.

*/
export const updateExplorerTree = (
  parentNode: RootNode | FolderNode,
  newNode: FileNode | FolderNode
): RootNode => {
  // Create a new array for children
  const newChildren = parentNode.children.map((child) => {
    return updateExplorerTree(child, newNode);
  });

  if (newChildren !== root.children) {
    // If any of the children changed, we need to return a new object for this node
    return { ...root, children: newChildren };
  }

  // No changes, so return the original node
  return root;
};

// Node represents the clicked file node
export const handleFileClick = async (
  node: ExplorerNode,
  setMainState: SetMainState,
  explorer: ExplorerState
) => {
  const fileHandle = node.fileHandle;

  if (fileHandle?.kind === "file") {
    const file = await fileHandle.getFile();
    const contents = await file.text();

    // Update state to mark the clicked node as selected
    setMainState(
      (prevState): MainState => ({
        ...prevState,
        explorer: {
          ...prevState.explorer,
          explorerTreeRoot: markAsSelected(
            prevState.explorer.explorerTreeRoot,
            node
          ),
          selectedNode: node,
        },
      })
    );
  }
};

// Recursively traverse explorerTreeRoot and mark the node as selected
const markAsSelected = (
  parentNode: RootNode | FolderNode,
  node: FileNode
): ExplorerNode => {
  if (tree === node) {
    return { ...tree, selected: true };
  }

  if (tree.children) {
    tree.children = tree.children.map((childNode) =>
      markAsSelected(childNode, node)
    );
  }

  return tree;
};
