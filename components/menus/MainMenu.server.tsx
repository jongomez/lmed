import {
  FileEditorState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import {
  createNewFile,
  openDirectory,
  openFile,
  saveFile,
  saveFileAs,
} from "@/utils/mainMenuUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  File,
  FilePlus,
  FolderOpen,
  Github,
  Import,
  Save,
  X,
} from "lucide-react";
import { MutableRefObject } from "react";
import { MenuItem, PopUpMenu } from "./PopUpMenu.server";

type MainMenuProps = {
  mainStateDispatch: MainStateDispatch;
  explorerNodeMap: MainState["explorerNodeMap"];
  fileEditorState: FileEditorState;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const MainMenu = ({
  mainStateDispatch,
  explorerNodeMap,
  fileEditorState,
  fileEditorRef,
}: MainMenuProps) => {
  const iconSize = 24;
  const iconClasses = "inline mr-2";

  return (
    // Main menu container and items.
    // 42px is the header's height.
    <PopUpMenu
      className="top-[42px] w-[200px]"
      onOverlayClick={() => mainStateDispatch({ type: "TOGGLE_MAIN_MENU" })}
    >
      <MenuItem
        onClick={() => {
          createNewFile(mainStateDispatch, explorerNodeMap, fileEditorRef);
          mainStateDispatch({ type: "TOGGLE_MAIN_MENU" });
        }}
      >
        <FilePlus size={iconSize} className={iconClasses} />
        New File
      </MenuItem>
      <MenuItem
        onClick={() => {
          openFile(mainStateDispatch, fileEditorRef, explorerNodeMap);
          mainStateDispatch({ type: "TOGGLE_MAIN_MENU" });
        }}
      >
        <File size={iconSize} className={iconClasses} />
        Open File
      </MenuItem>
      <MenuItem
        onClick={() => {
          openDirectory(mainStateDispatch, explorerNodeMap);
          mainStateDispatch({ type: "TOGGLE_MAIN_MENU" });
        }}
      >
        <FolderOpen size={iconSize} className={iconClasses} />
        Open Directory
      </MenuItem>
      <MenuItem
        onClick={() => {
          saveFile(mainStateDispatch, explorerNodeMap, fileEditorRef);
          mainStateDispatch({ type: "TOGGLE_MAIN_MENU" });
        }}
      >
        <Save size={iconSize} className={iconClasses} />
        Save
      </MenuItem>
      <MenuItem
        onClick={() => {
          saveFileAs(mainStateDispatch, explorerNodeMap, fileEditorRef);
          mainStateDispatch({ type: "TOGGLE_MAIN_MENU" });
        }}
      >
        <Import size={iconSize} className={iconClasses} />
        Save As...
      </MenuItem>
      <a
        href="https://github.com/jongomez/lmed"
        target="_blank"
        rel="noreferrer"
      >
        <MenuItem
          onClick={() => {
            mainStateDispatch({ type: "TOGGLE_MAIN_MENU" });
          }}
        >
          <Github size={iconSize} className={iconClasses} />
          Github
        </MenuItem>
      </a>
      <MenuItem onClick={() => mainStateDispatch({ type: "TOGGLE_MAIN_MENU" })}>
        <X size={iconSize} className={iconClasses} />
        Close Menu
      </MenuItem>
    </PopUpMenu>
  );
};
