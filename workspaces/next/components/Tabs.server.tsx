// This doesn't work :( https://tailwindcss.com/docs/content-configuration#dynamic-class-names
// const MAIN_TAB_HEADER_HEIGHT = "40px";
// const MAIN_TAB_PANEL_HEIGHT = `h-[calc(100%-${MAIN_TAB_HEADER_HEIGHT})]`;

import { EditorState, MainStateDispatch } from "@/types/MainTypes";
import { Edit, MenuIcon, Settings, Terminal } from "lucide-react";
import { ReactNode } from "react";

// Assuming main tab header height is 40px, and footer height is 20px.
// Add 2 pixels for header boder, and 2 pixels for footer margin. We have: 40px+20px+2px+2px=64px
// export const MAIN_TAB_PANEL_HEIGHT = "h-[calc(100vh_-_64px)]";

type TabProps = {
  onTabClick: (tab: number) => void;
  isActive?: boolean;
  className?: string;
  children: ReactNode;
};

export const Tab = ({
  onTabClick,
  isActive,
  className,
  children,
}: TabProps) => {
  return (
    <div
      // key={key}
      onClick={() => onTabClick(1)}
      className={`${className || ""}
        cursor-pointer py-2 px-4 inline-block shadow-[0px_2px_0px_0px]
        ${
          isActive
            ? "text-blue-600 dark:text-blue-300 shadow-active-colors"
            : "main-text-colors hover-main-text-colors shadow-innactive-colors"
        }`}
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
        className="mr-5"
      >
        <Settings size={iconSize} />
      </Tab>
    </>
  );
};

type EditorFileTabsProps = {
  editorState: EditorState;
  mainStateDispatch: MainStateDispatch;
};

export const EditorFileTabs = ({
  editorState,
  mainStateDispatch,
}: EditorFileTabsProps) => {
  return (
    <>
      {editorState.allTabs.map((tab, index) => (
        <Tab
          onTabClick={() =>
            mainStateDispatch({ type: "SET_CURRENT_TAB", payload: tab })
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

/*
// Old code:
type MainTabPanelProps = {
  activeIndex: number;
  tabPanelIndex: number;
  children: ReactNode;
  className?: string;
};

export const MainTabPanel = ({
  activeIndex,
  tabPanelIndex,
  className,
  children,
}: MainTabPanelProps) => (
  <div
    className={`${className || " "} ${
      activeIndex === tabPanelIndex ? "" : "hidden"
    } flex-grow w-screen `}
  >
    {children}
  </div>
);
*/
