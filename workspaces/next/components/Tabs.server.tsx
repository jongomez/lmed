import { ReactNode } from "react";

// This doesn't work :( https://tailwindcss.com/docs/content-configuration#dynamic-class-names
// const MAIN_TAB_HEADER_HEIGHT = "40px";
// const MAIN_TAB_PANEL_HEIGHT = `h-[calc(100%-${MAIN_TAB_HEADER_HEIGHT})]`;

type MainTabHeaderProps = {
  tabs: string[];
  onTabClick: (tab: number) => void;
  activeIndex: number;
};

export const MainTabHeader = ({
  tabs,
  onTabClick,
  activeIndex,
}: MainTabHeaderProps) => {
  return (
    <div className="flex-grow-0 flex-shrink-0 h-40px">
      {tabs.map((tab, index) => {
        return (
          <div
            key={index}
            onClick={() => onTabClick(index)}
            className={`
              cursor-pointer py-2 px-4 inline-block 
              border-b-2 
              ${
                activeIndex === index
                  ? "text-blue-600 dark:text-blue-300 border-blue-600 dark:border-blue-300"
                  : "text-slate-500 dark:text-slate-400 border-gray-200 dark:border-gray-700"
              }`}
          >
            {tab}
          </div>
        );
      })}
    </div>
  );
};

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
    } flex-grow`}
  >
    {children}
  </div>
);