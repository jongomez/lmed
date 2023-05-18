import { ExplorerNode, SetMainState } from "@/types/Main";
import { Button, List } from "@mui/material";
import { useState } from "react";
import "react-folder-tree/dist/style.css";

type ExplorerProps = {
  explorerRootNode: ExplorerNode;
  setMainState: SetMainState;
};

type ExplorerState = {
  files: ExplorerNode;
  currentPath: string;
};

type ExplorerTreeViewerProps = {
  node: ExplorerNode;
  setMainState: SetMainState;
};

const ExplorerTreeViewer = ({
  node,
  setMainState,
}: ExplorerTreeViewerProps) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div key={index}>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon>
          <FolderIcon />
        </ListItemIcon>
        <ListItemText primary={node.name} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {node.children?.map((childNode) => renderNode(childNode))}
        </List>
      </Collapse>
    </div>
  );
};

export const Explorer = ({ explorerRootNode, setMainState }: ExplorerProps) => {
  const handleOpenFileClick = async () => {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();

    setFileExplorerState((prevState) => ({
      ...prevState,
      files: [...prevState.files, { name: file.name }],
    }));
  };

  const handleOpenFolderClick = async () => {
    const dirHandle = await window.showDirectoryPicker();
    const children: NodeData[] = [];

    for await (const entry of dirHandle.values()) {
      children.push({ name: entry.name });
    }

    setFileExplorerState((prevState) => ({
      ...prevState,
      files: [...prevState.files, { name: dirHandle.name, children }],
    }));
  };

  const onTreeStateChange = (state: NodeData, event: unknown) => {
    console.log(state, event);
  };

  const handleNameClick = ({ nodeData }: { nodeData: NodeData }) => {
    console.log("node data clicked:");
    console.log(nodeData);
  };

  return (
    <div>
      <Button variant="contained" onClick={handleOpenFileClick}>
        Open File
      </Button>
      <Button variant="contained" onClick={handleOpenFolderClick}>
        Open Folder
      </Button>

      {/* File and folder tree */}
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
      >
        <ExplorerTreeViewer
          node={explorerRootNode}
          setMainState={setMainState}
        />
      </List>
    </div>
  );
};
