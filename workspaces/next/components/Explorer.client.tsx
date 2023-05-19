import { ExplorerNode, MainState, SetMainState } from "@/types/Main";
import { updateExplorerTree } from "@/utils/explorerUtils";
import {
  ExpandLess,
  ExpandMore,
  Folder,
  InsertDriveFile,
} from "@mui/icons-material";
import {
  Button,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import "react-folder-tree/dist/style.css";

type ExplorerProps = {
  explorerRootNode: ExplorerNode;
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
  const handleFileClick = () => {
    if (node.type !== "file") {
      throw new Error("handleFileClick called on non-file node");
    }

    setMainState((prevState): MainState => {
      // updating state for file click
      const newNode = { ...node, selected: true };

      return {
        ...prevState,
        explorer: { ...prevState.explorer, selectedNode: node },
      };
    });
  };

  const handleFolderClick = () => {
    if (node.type !== "folder") {
      throw new Error("handleFolderClick called on non-folder node");
    }

    setMainState((prevState): MainState => {
      // updating state for folder click
      const newNode = { ...node, expanded: !node.expanded };

      return {
        ...prevState,
        explorer: {
          ...prevState.explorer,
          explorerTreeRoot: updateExplorerTree(
            prevState.explorer.explorerTreeRoot,
            newNode
          ),
        },
      };
    });
  };

  if (node.type === "folder") {
    return (
      <>
        <ListItemButton onClick={handleFolderClick}>
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
      <ListItemButton onClick={handleFileClick}>
        <ListItemIcon>
          <InsertDriveFile />
        </ListItemIcon>
        <ListItemText primary={node.name} />
      </ListItemButton>
    );
  } else {
    return null;
  }
};

export const Explorer = ({ explorerRootNode, setMainState }: ExplorerProps) => {
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
