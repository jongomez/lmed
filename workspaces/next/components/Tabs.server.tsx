import { ReactNode } from "react";

// This doesn't work :( https://tailwindcss.com/docs/content-configuration#dynamic-class-names
// const MAIN_TAB_HEADER_HEIGHT = "40px";
// const MAIN_TAB_PANEL_HEIGHT = `h-[calc(100%-${MAIN_TAB_HEADER_HEIGHT})]`;

// Assuming main tab header height is 40px, and footer height is 20px.
// Add 2 pixels for header boder, and 2 pixels for footer margin. We have: 40px+20px+2px+2px=64px
export const MAIN_TAB_PANEL_HEIGHT = "h-[calc(100vh_-_64px)]";

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
              main-tab-base 
              ${
                activeIndex === index ? "active-main-tab" : "innactive-main-tab"
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
    } ${MAIN_TAB_PANEL_HEIGHT} w-screen `}
  >
    {children}
  </div>
);
