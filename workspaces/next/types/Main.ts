import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";

export type MainState = {
  socket: Socket | undefined;
  tabIndex: number;
  explorer: ExplorerState;
};

export type SetMainState = Dispatch<SetStateAction<MainState>>;

export type ExplorerNode = {
  name: string;
  type: "file" | "folder" | "root";
  selected: boolean; // only files can be selected
  expanded: boolean; // only folders can be expanded
  children?: ExplorerNode[];
};

export type ExplorerState = {
  explorerTreeRoot: ExplorerNode;
  selectedNode: ExplorerNode | null;
};
