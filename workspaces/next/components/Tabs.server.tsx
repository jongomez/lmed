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
  Settings,
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
  activeIndex: number;
  mainStateDispatch: MainStateDispatch;
  isMainMenuOpen: boolean;
};

export const TabsOnTheLeft = ({
  activeIndex,
  mainStateDispatch,
  isMainMenuOpen,
}: TabsOnTheLeftProps) => {
  const iconSize = 24;
  const onIconTabClick = (tab: number) => {
    mainStateDispatch({ type: "SET_ICON_TAB", payload: tab });
  };

  return (
    <>
      {/* The menu icon tab is different - it's not really a tab, it's more like a button. */}
      <Tab
        onTabClick={() => {
          if (isMainMenuOpen) {
            mainStateDispatch({ type: "CLOSE_MAIN_MENU" });
          } else {
            mainStateDispatch({ type: "OPEN_MAIN_MENU" });
          }
        }}
        isActive={isMainMenuOpen}
        // className={`${isMainMenuOpen ? "z-50" : ""}`}
      >
        <MenuIcon size={iconSize} />
      </Tab>

      <Tab onTabClick={() => onIconTabClick(0)} isActive={activeIndex === 0}>
        <MessageCircle size={iconSize} />
      </Tab>

      <Tab onTabClick={() => onIconTabClick(0)} isActive={activeIndex === 0}>
        <Folders size={iconSize} />
      </Tab>
    </>
  );
};

type TabsOnTheRightProps = {
  activeIndex: number;
  mainStateDispatch: MainStateDispatch;
};

export const TabsOnTheRight = ({
  activeIndex,
  mainStateDispatch,
}: TabsOnTheRightProps) => {
  const iconSize = 24;
  const onIconTabClick = (tab: number) => {
    mainStateDispatch({ type: "SET_ICON_TAB", payload: tab });
  };

  return (
    <>
      <Tab onTabClick={() => onIconTabClick(0)} isActive={activeIndex === 0}>
        <Edit size={iconSize} />
      </Tab>

      <Tab onTabClick={() => onIconTabClick(1)} isActive={activeIndex === 1}>
        <Terminal size={iconSize} />
      </Tab>
      <Tab
        onTabClick={() => onIconTabClick(2)}
        isActive={activeIndex === 2}
        className="mr-[26px]"
      >
        <Settings size={iconSize} />
      </Tab>
    </>
  );
};

type FileEditorTabsProps = {
  fileEditorState: FileEditorState;
  explorerNodeMap: MainState["explorerNodeMap"];
  mainStateDispatch: MainStateDispatch;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  activeMainTab: number;
};

export const FileEditorTabs = ({
  fileEditorState,
  explorerNodeMap,
  mainStateDispatch,
  fileEditorRef,
  activeMainTab,
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
            className={`${
              activeMainTab === 0 ? "" : "hidden"
            } flex justify-center items-center ${
              fileNode.isDirty ? "font-bold italic" : ""
            }`}
          >
            {fileNode.name}
            <X
              size={16}
              className="ml-2 hover-main-text-colors hover:stroke-[3px]"
              onClick={(e) => {
                e.stopPropagation();
                mainStateDispatch({
                  type: "CLOSE_FILE",
                  payload: {
                    fileNode: fileNode,
                    fileEditor: fileEditorRef.current,
                  },
                });
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
