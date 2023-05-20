import type { ExplorerNode, ExplorerState, SetMainState } from "@/types/Main";
import {
  handleDirectoryClick,
  handleFileClick,
  openDirectory,
  openFile,
} from "@/utils/explorerUtils";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Folder from "@mui/icons-material/Folder";
import InsertDriveFile from "@mui/icons-material/InsertDriveFile";

import {
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

type ExplorerProps = {
  explorerState: ExplorerState;
  setMainState: SetMainState;
};

type ExplorerTreeViewerProps = {
  node: ExplorerNode;
  setMainState: SetMainState;
};

const ExplorerTreeViewer = ({
  node,
  setMainState,
}: ExplorerTreeViewerProps) => {
  if (node.type === "directory") {
    return (
      <>
        <ListItemButton
          onClick={() => handleDirectoryClick(node, setMainState)}
        >
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary={node.name} />
          {node.expanded ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={node.expanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children?.map((childNode, index) => (
              <ExplorerTreeViewer
                node={childNode}
                setMainState={setMainState}
                key={index}
              />
            ))}
          </List>
        </Collapse>
      </>
    );
  } else if (node.type === "file") {
    return (
      <ListItemButton onClick={() => handleFileClick(node, setMainState)}>
        <ListItemIcon>
          <InsertDriveFile />
        </ListItemIcon>
        <ListItemText primary={node.name} />
      </ListItemButton>
    );
  } else {
    // Root node (hopefully).
    return null;
  }
};

export const Explorer = ({ explorerState, setMainState }: ExplorerProps) => {
  return (
    <div>
      <Button
        variant="contained"
        onClick={() => openFile(setMainState, explorerState)}
      >
        Open File
      </Button>
      <Button
        variant="contained"
        onClick={() => openDirectory(setMainState, explorerState)}
      >
        Open Directory
      </Button>

      {/* File and directory tree */}
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
      >
        <ExplorerTreeViewer
          node={explorerState.explorerTreeRoot}
          setMainState={setMainState}
        />
      </List>
    </div>
  );
};
