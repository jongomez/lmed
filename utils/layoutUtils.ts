import { LayoutState } from "@/types/MainTypes";
import { CSSProperties } from "react";
import { RESIZE_HANDLE_SIZE_PX } from "./constants";

const LAYOUT_LOCAL_STORAGE_KEY = "layout";

const editorGridClasses = "";
const chatGridClasses = "";

export const setLayoutInLocalStorage = (layout: LayoutState) => {
  window.localStorage.setItem(LAYOUT_LOCAL_STORAGE_KEY, JSON.stringify(layout));
};

export const getLayoutFromLocalStorage = (): LayoutState | null => {
  const localStorageTheme = window.localStorage.getItem(
    LAYOUT_LOCAL_STORAGE_KEY
  );

  return localStorageTheme ? JSON.parse(localStorageTheme) : null;
};

export const defaultLayout: LayoutState = {
  mode: "horizontal",
  resizableColSize: 400,
  resizableRowSize: 400,
};

type MainGridStyles = {
  mainGridStyle: CSSProperties;
  explorerClassNames: string;
  resizeHandleClassNames: string;
  fileEditorClassNames: string;
  terminalClassNames: string;
  chatClassNames: string;
  resizeHandleInitialSize: number;
};

export const getMainGridStyles = (layout: LayoutState): MainGridStyles => {
  const { resizableRowSize, resizableColSize, mode } = layout;
  // Initial dummy values.
  let explorerClassNames = "",
    resizeHandleClassNames = "",
    fileEditorClassNames = "";
  let mainGridStyle: CSSProperties = {};
  let resizeHandleInitialSize = 0;

  // Horizontal mode means there's a vertical line.
  if (mode === "horizontal") {
    // Use style={{}} for the grid layout values - because tailwind is not great with dynamic values.
    // (the grid is dynamic because users can resize it)
    mainGridStyle = {
      gridTemplateRows: "1fr",
      gridTemplateColumns:
        resizableColSize + "px " + RESIZE_HANDLE_SIZE_PX + "px 1fr",
      display: "grid",
      height: "calc(100vh - 42px)",
    };

    explorerClassNames = "row-start-1";
    resizeHandleClassNames = "row-start-1 row-span-full col-start-2";
    fileEditorClassNames = "row-start-1 col-start-3";

    resizeHandleInitialSize = resizableColSize;
  } else if (mode === "vertical") {
    // Vertical mode means there's a horizontal line.
    // TODO:

    resizeHandleInitialSize = resizableRowSize;
  }

  // The terminal is in the same place as the file editor.
  const terminalClassNames = fileEditorClassNames;
  // The chat is in the same place as the explorer.
  const chatClassNames = explorerClassNames;

  return {
    mainGridStyle,
    explorerClassNames,
    resizeHandleClassNames,
    fileEditorClassNames,
    terminalClassNames,
    chatClassNames,
    resizeHandleInitialSize,
  };
};
