// This doesn't work :( https://tailwindcss.com/docs/content-configuration#dynamic-class-names
// const MAIN_TAB_HEADER_HEIGHT = "40px";
// const MAIN_TAB_PANEL_HEIGHT = `h-[calc(100%-${MAIN_TAB_HEADER_HEIGHT})]`;

import {
  FileEditorState,
  MainStateDispatch,
  PromptEditorState,
} from "@/types/MainTypes";
import {
  ChevronsRightLeft,
  Code,
  Edit,
  History,
  MenuIcon,
  Settings,
  Terminal,
} from "lucide-react";
import { ReactNode } from "react";

// Assuming main tab header height is 40px, and footer height is 20px.
// Add 2 pixels for header boder, and 2 pixels for footer margin. We have: 40px+20px+2px+2px=64px
// export const MAIN_TAB_PANEL_HEIGHT = "h-[calc(100vh_-_64px)]";

type TabProps = {
  onTabClick: () => void;
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
      onClick={() => onTabClick()}
      className={`${className}
        cursor-pointer py-2 px-4 inline-block shadow-[0px_2px_0px_0px]
        ${
          isActive
            ? "text-blue-600 dark:text-blue-300 shadow-active-colors"
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
      onClick={() => onTabClick()}
      className={`
        cursor-pointer py-2 px-4 inline-block
        ${
          isActive
            ? `text-blue-600 dark:text-blue-300 
            border-l-4 border-active-colors
            bg-blue-50 dark:bg-slate-700`
            : `main-text-colors hover-main-text-colors ml-1`
        }`}
      {...props}
    >
      {children}
    </div>
  );
};

type MainTabsProps = {
  activeIndex: number;
  mainStateDispatch: MainStateDispatch;
  isMainMenuOpen: boolean;
};

export const MainTabs = ({
  activeIndex,
  mainStateDispatch,
  isMainMenuOpen,
}: MainTabsProps) => {
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
      >
        <MenuIcon size={iconSize} />
      </Tab>

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

type EditorFileTabsProps = {
  fileEditorState: FileEditorState;
  mainStateDispatch: MainStateDispatch;
};

export const FileEditorTabs = ({
  fileEditorState,
  mainStateDispatch,
}: EditorFileTabsProps) => {
  return (
    <>
      {fileEditorState.allTabs.map((tab, index) => (
        <Tab
          onTabClick={() =>
            mainStateDispatch({ type: "SET_CURRENT_FILE_TAB", payload: tab })
          }
          key={index}
          isActive={tab.selected}
        >
          {tab.fileNode.name}
        </Tab>
      ))}
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
        <History size={iconSize} className={iconClasses} />
        {allTabs[2].tabName}
      </SideTab>
    </div>
  );
};
