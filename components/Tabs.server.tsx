import {
  FileEditorState,
  MainState,
  MainStateDispatch,
  PromptEditorState,
} from "@/types/MainTypes";
import { getFileNode } from "@/utils/explorerUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import {
  ChevronsRightLeft,
  Code,
  Edit,
  Folders,
  MenuIcon,
  MessageCircle,
  Settings as SettingsIcon,
  Terminal,
  X,
} from "lucide-react";
import { MutableRefObject, ReactNode } from "react";

// Assuming main tab header height is 40px, and footer height is 20px.
// Add 2 pixels for header boder, and 2 pixels for footer margin. We have: 40px+20px+2px+2px=64px
// export const MAIN_TAB_PANEL_HEIGHT = "h-[calc(100vh_-_64px)]";

type TabProps = {
  onTabClick?: () => void;
  isActive?: boolean;
  className?: string;
  children: ReactNode;
} & JSX.IntrinsicElements["div"];

export const Tab = ({
  onTabClick,
  isActive,
  className = "",
  children,
  ...props
}: TabProps) => {
  return (
    <div
      // key={key}
      onClick={() => onTabClick?.()}
      className={`${className}
        cursor-pointer py-2 px-3 inline-block shadow-[0px_2px_0px_0px]
        ${
          isActive
            ? "active-main-text-colors shadow-active-colors"
            : "main-text-colors hover-main-text-colors shadow-innactive-colors"
        }`}
      {...props}
    >
      {children}
    </div>
  );
};

export const SideTab = ({
  onTabClick,
  isActive,
  children,
  ...props
}: TabProps) => {
  return (
    <div
      onClick={() => onTabClick?.()}
      // the default x padding is 16px. When innactive, we add 4 px to the left to emulate an innactive border.
      className={`cursor-pointer py-2 px-4 inline-block w-full
        ${
          isActive
            ? `active-main-text-colors 
            border-l-4 border-active-colors
            bg-active-colors`
            : `main-text-colors hover-main-text-colors pl-5`
        }`}
      {...props}
    >
      {children}
    </div>
  );
};

type TabsOnTheLeftProps = {
  mainStateDispatch: MainStateDispatch;
  activeHeaderItems: MainState["activeHeaderItems"];
};

export const TabsOnTheLeft = ({
  mainStateDispatch,
  activeHeaderItems,
}: TabsOnTheLeftProps) => {
  const iconSize = 24;

  return (
    <>
      {/* The menu icon tab is different - it's not really a tab, it's more like a button. */}
      <Tab
        onTabClick={() => {
          mainStateDispatch({ type: "TOGGLE_MAIN_MENU" });
        }}
        isActive={activeHeaderItems.mainMenu}
        // className={`${isMainMenuOpen ? "z-50" : ""}`}
        data-testid="main-menu"
      >
        <MenuIcon size={iconSize} />
      </Tab>

      <Tab
        onTabClick={() => {
          mainStateDispatch({ type: "ACTIVATE_CHAT" });
        }}
        isActive={activeHeaderItems.chat}
      >
        <MessageCircle size={iconSize} />
      </Tab>

      <Tab
        onTabClick={() => {
          mainStateDispatch({ type: "ACTIVATE_EXPLORER" });
        }}
        isActive={activeHeaderItems.explorer}
      >
        <Folders size={iconSize} />
      </Tab>
    </>
  );
};

type TabsOnTheRightProps = {
  activeHeaderItems: MainState["activeHeaderItems"];
  mainStateDispatch: MainStateDispatch;
};

export const TabsOnTheRight = ({
  activeHeaderItems,
  mainStateDispatch,
}: TabsOnTheRightProps) => {
  const iconSize = 24;

  return (
    <>
      <Tab
        onTabClick={() => {
          mainStateDispatch({ type: "ACTIVATE_FILE_EDITOR" });
        }}
        isActive={activeHeaderItems.fileEditor}
      >
        <Edit size={iconSize} />
      </Tab>

      <Tab
        onTabClick={() => {
          mainStateDispatch({ type: "ACTIVATE_TERMINAL" });
        }}
        isActive={activeHeaderItems.terminal}
      >
        <Terminal size={iconSize} />
      </Tab>
      <Tab
        onTabClick={() => {
          mainStateDispatch({ type: "TOGGLE_SETTINGS" });
        }}
        isActive={activeHeaderItems.settings}
        // className="mr-[26px]"
      >
        <SettingsIcon size={iconSize} />
      </Tab>
    </>
  );
};

type FileEditorTabsProps = {
  fileEditorState: FileEditorState;
  explorerNodeMap: MainState["explorerNodeMap"];
  mainStateDispatch: MainStateDispatch;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  isEditorShowing: boolean;
};

export const FileEditorTabs = ({
  fileEditorState,
  explorerNodeMap,
  mainStateDispatch,
  fileEditorRef,
  isEditorShowing,
}: FileEditorTabsProps) => {
  return (
    <>
      {fileEditorState.openFilePaths.map((filePath, index) => {
        const fileNode = getFileNode(explorerNodeMap, filePath);

        return (
          <Tab
            onTabClick={() =>
              mainStateDispatch({
                type: "SWITCH_FILE",
                payload: {
                  fileNode: fileNode,
                  fileEditor: fileEditorRef.current,
                },
              })
            }
            key={index}
            isActive={fileNode.selected}
            className={`whitespace-nowrap 
              ${isEditorShowing ? "" : "hidden"} 
              flex justify-center items-center 
              ${fileNode.isDirty ? "font-bold italic" : ""}
            `}
            role="file-tab"
          >
            {fileNode.name}
            <X
              size={16}
              className="ml-2 hover-main-text-colors hover:stroke-[3px]"
              onClick={(e) => {
                e.stopPropagation();

                if (fileEditorState.openFilePaths.length === 1) {
                  console.log("Can't close last tab");
                  return;
                }

                if (
                  !fileNode.isDirty ||
                  confirm("File is dirty. Still want to close tab?") == true
                ) {
                  mainStateDispatch({
                    type: "CLOSE_FILE",
                    payload: {
                      fileNode: fileNode,
                      fileEditor: fileEditorRef.current,
                    },
                  });
                }
              }}
            />
          </Tab>
        );
      })}
    </>
  );
};

type PromptTabsProps = {
  promptEditorState: PromptEditorState;
  mainStateDispatch: MainStateDispatch;
  className: string;
};

export const PromptTabs = ({
  promptEditorState,
  mainStateDispatch,
  className,
}: PromptTabsProps) => {
  const { allTabs } = promptEditorState;
  const iconSize = 24;
  const iconClasses = "inline-block mr-2";

  return (
    <div className={className}>
      <SideTab
        onTabClick={() =>
          mainStateDispatch({
            type: "SET_CURRENT_PROMPT_TAB",
            payload: allTabs[0].tabName,
          })
        }
        isActive={allTabs[0].selected}
      >
        <ChevronsRightLeft size={iconSize} className={iconClasses} />
        {allTabs[0].tabName}
      </SideTab>

      <SideTab
        onTabClick={() =>
          mainStateDispatch({
            type: "SET_CURRENT_PROMPT_TAB",
            payload: allTabs[1].tabName,
          })
        }
        isActive={allTabs[1].selected}
      >
        <Code size={iconSize} className={iconClasses} />
        {allTabs[1].tabName}
      </SideTab>

      <SideTab
        onTabClick={() =>
          mainStateDispatch({
            type: "SET_CURRENT_PROMPT_TAB",
            payload: allTabs[2].tabName,
          })
        }
        isActive={allTabs[2].selected}
      >
        <MessageCircle size={iconSize} className={iconClasses} />
        {allTabs[2].tabName}
      </SideTab>
    </div>
  );
};
