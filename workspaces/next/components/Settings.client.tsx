import { EditorState, MainStateDispatch } from "@/types/MainTypes";
import { useSettings } from "@/utils/hooks";
import { Moon, Sun } from "lucide-react";

/*

Thanks:
https://sdorra.dev/posts/2022-11-17-dark-mode-with-next

*/

type SettingsProps = {
  editorState: EditorState;
  mainStateDispatch: MainStateDispatch;
  className: string;
};

export const Settings = ({
  editorState,
  mainStateDispatch,
  className,
}: SettingsProps) => {
  const settings = useSettings();
  const currentSiteTheme = settings.siteTheme;

  const onThemeSwitchClick = () => {
    settings.toggleSiteTheme();
  };

  return (
    <div className={className}>
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
