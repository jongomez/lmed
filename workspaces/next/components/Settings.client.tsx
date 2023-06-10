import { FileEditorState, MainStateDispatch } from "@/types/MainTypes";
import { useTheme } from "@/utils/hooks/randomHooks";
import { Moon, Sun } from "lucide-react";
import { Modal } from "./base/Modal.client";

/*

Thanks:
https://sdorra.dev/posts/2022-11-17-dark-mode-with-next

*/

type SettingsProps = {
  fileEditorState: FileEditorState;
  mainStateDispatch: MainStateDispatch;
};

export const Settings = ({
  fileEditorState,
  mainStateDispatch,
}: SettingsProps) => {
  const { siteTheme, toggleSiteTheme } = useTheme();

  const onThemeSwitchClick = () => {
    toggleSiteTheme();
  };

  return (
    <Modal
      isOpen
      closeActionCallback={() => {
        mainStateDispatch({ type: "TOGGLE_SETTINGS" });
      }}
      overlayClassNames="bg-black bg-opacity-10"
      className="w-[400px]"
    >
      <div className="flex">
        Dark mode / Light mode
        <button
          onClick={onThemeSwitchClick}
          title={`Enable ${siteTheme === "dark" ? "light" : "dark"} mode`}
          className="ml-2"
        >
          {siteTheme === "dark" ? (
            <Sun className="main-text-colors" />
          ) : (
            <Moon className="main-text-colors" />
          )}
        </button>
      </div>
    </Modal>
  );
};
