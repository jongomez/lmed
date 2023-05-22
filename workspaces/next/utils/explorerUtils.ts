import type {
  DirectoryNode,
  ExplorerState,
  FileNode,
  MainState,
  RootNode,
  SetMainState,
} from "@/types/Main";
import { createNewTab } from "./editorUtils";

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

const createFileNode = (
  id: number,
  fileHandle: FileSystemFileHandle,
  parentNode: RootNode | DirectoryNode
): FileNode => {
  return {
    id,
    fileHandle,
    parentNode,
    name: fileHandle.name,
    type: "file",
    selected: false,
  };
};

const createDirectoryNode = (
  id: number,
  directoryHandle: FileSystemDirectoryHandle,
  parentNode: RootNode | DirectoryNode
): DirectoryNode => {
  return {
    id,
    directoryHandle,
    parentNode,
    name: directoryHandle.name,
    type: "directory",
    expanded: false,
    children: [],
  };
};

const createExplorerTree = async (
  rootNode: RootNode,
  parentNode: RootNode | DirectoryNode,
  dirHandle: FileSystemDirectoryHandle
): Promise<RootNode> => {
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

export const handleFileClick = async (
  fileNode: FileNode,
  setMainState: SetMainState
) => {
  let file: File | Blob;
  if (fileNode.fileHandle) {
    file = await fileNode.fileHandle.getFile();
  } else if (fileNode.file) {
    file = fileNode.file;
  } else {
    throw new Error("No fileHandle or fileNode.file found :(");
  }

  const contents = await file.text();

  // Update the fileNode.
  fileNode.selected = true;

  // Update state in a function to access prevState
  setMainState((prevState): MainState => {
    // Check if tab is already open
    let currentTab = prevState.editor.allTabs.find(
      (tab) => tab.fileNode.id === fileNode.id
    );
    let allTabs = prevState.editor.allTabs;

    if (!currentTab) {
      // Switch to existing tab
      // TODO: FIX THIS as File assertion!
      currentTab = createNewTab(fileNode, file as File, contents);
      allTabs = [...prevState.editor.allTabs, currentTab];
    }

    return {
      ...prevState,
      explorer: {
        ...prevState.explorer,
        selectedNode: fileNode,
      },
      editor: {
        ...prevState.editor,
        currentTab,
        allTabs,
      },
    };
  });
};

export const handleDirectoryClick = async (
  directoryNode: DirectoryNode,
  setMainState: SetMainState
) => {
  // Toggle expanded state.
  // WARNING: This is bad. We're mutating an object in state.
  // ... well, it's not really in state. The root node is in state. We're mutating a child.
  directoryNode.expanded = !directoryNode.expanded;

  // Update the tree.
  // updateExplorerTreeNode(directoryNode, directoryNode);

  setMainState(
    (prevState): MainState => ({
      ...prevState,
      explorer: {
        ...prevState.explorer,
        selectedNode: directoryNode,
      },
    })
  );
};
