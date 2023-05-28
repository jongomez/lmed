import { FileEditorState, MainStateDispatch } from "@/types/MainTypes";
import { useSettings } from "@/utils/hooks";
import { Moon, Sun } from "lucide-react";

/*

Thanks:
https://sdorra.dev/posts/2022-11-17-dark-mode-with-next

*/

type SettingsProps = {
  fileEditorState: FileEditorState;
  mainStateDispatch: MainStateDispatch;
  activeTab: number;
};

export const Settings = ({
  fileEditorState,
  mainStateDispatch,
  activeTab,
}: SettingsProps) => {
  const settings = useSettings();
  const currentSiteTheme = settings.siteTheme;
  const isVisible = activeTab === 2;

  const onThemeSwitchClick = () => {
    settings.toggleSiteTheme();
  };

  return (
    <div className={`${isVisible ? "" : "hidden"} h-[calc(100vh_-_42px)]`}>
      <button
        onClick={onThemeSwitchClick}
        title={`Enable ${currentSiteTheme === "dark" ? "light" : "dark"} mode`}
      >
        {currentSiteTheme === "dark" ? (
          <Sun className="text-dark dark:text-white" />
        ) : (
          <Moon className="text-dark dark:text-white" />
        )}
      </button>
    </div>
  );
};
