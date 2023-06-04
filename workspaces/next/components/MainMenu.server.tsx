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
import { MutableRefObject, ReactNode } from "react";

type MenuItemProps = {
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

const MenuItem = ({ onClick, children, className }: MenuItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`p-2 cursor-pointer main-text-colors hover-main-text-colors ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
};

type MainMenuProps = {
  mainStateDispatch: MainStateDispatch;
  className?: string;
  explorerNodeMap: MainState["explorerNodeMap"];
  fileEditorState: FileEditorState;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const MainMenu = ({
  mainStateDispatch,
  explorerNodeMap,
  fileEditorState,
  className,
  fileEditorRef,
}: MainMenuProps) => {
  const iconSize = 24;
  const iconClasses = "inline mr-2";

  return (
    <>
      {/* Menu overlay - when clicked, it closes the menu. */}
      <div
        onClick={() => mainStateDispatch({ type: "CLOSE_MAIN_MENU" })}
        // className="fixed top-[42px] left-0 w-full h-[calc(100vh_-_42px)] z-10 bg-black bg-opacity-50"
        // className="fixed top-0 left-0 w-full h-full z-10 bg-black bg-opacity-50"
        className="fixed top-0 left-0 w-full h-full z-40"
      ></div>

      {/* Main menu container and items.
       42px is the header's height. */}
      <div
        className={`top-[42px] w-[200px] absolute p-3
      border-r-2 border-b-2 border-innactive-colors 
       z-50 bg-white dark:bg-slate-800 ${className || ""} `}
      >
        <MenuItem
          onClick={() => {
            createNewFile(mainStateDispatch, explorerNodeMap, fileEditorRef);
            mainStateDispatch({ type: "CLOSE_MAIN_MENU" });
          }}
        >
          <FilePlus size={iconSize} className={iconClasses} />
          New File
        </MenuItem>
        <MenuItem
          onClick={() => {
            openFile(mainStateDispatch, fileEditorRef, explorerNodeMap);
            mainStateDispatch({ type: "CLOSE_MAIN_MENU" });
          }}
        >
          <File size={iconSize} className={iconClasses} />
          Open File
        </MenuItem>
        <MenuItem
          onClick={() => {
            openDirectory(mainStateDispatch, explorerNodeMap);
            mainStateDispatch({ type: "CLOSE_MAIN_MENU" });
          }}
        >
          <FolderOpen size={iconSize} className={iconClasses} />
          Open Directory
        </MenuItem>
        <MenuItem
          onClick={() => {
            saveFile(
              mainStateDispatch,
              explorerNodeMap,
              fileEditorState,
              fileEditorRef
            );
            mainStateDispatch({ type: "CLOSE_MAIN_MENU" });
          }}
        >
          <Save size={iconSize} className={iconClasses} />
          Save
        </MenuItem>
        <MenuItem
          onClick={() =>
            saveFileAs(
              mainStateDispatch,
              explorerNodeMap,
              fileEditorState,
              fileEditorRef
            )
          }
        >
          <Import size={iconSize} className={iconClasses} />
          Save As...
        </MenuItem>
        <a href="https://www.github.com" target="_blank" rel="noreferrer">
          <MenuItem onClick={() => {}}>
            <Github size={iconSize} className={iconClasses} />
            Github
          </MenuItem>
        </a>
        <MenuItem
          onClick={() => mainStateDispatch({ type: "CLOSE_MAIN_MENU" })}
        >
          <X size={iconSize} className={iconClasses} />
          Close Menu
        </MenuItem>
      </div>
    </>
  );
};
