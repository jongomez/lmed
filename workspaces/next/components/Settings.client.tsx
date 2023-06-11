import {
  FileEditorState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { useTheme } from "@/utils/hooks/randomHooks";
import { Moon, Sun } from "lucide-react";
import { ReactNode } from "react";
import { Modal } from "./base/Modal.client";
import { H3 } from "./base/Typography.server";

type SettingsSectionProps = {
  title: string;
  children: ReactNode;
};

const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  return (
    <div>
      <H3 className="text-center font-bold mb-3">{title}</H3>
      {children}
    </div>
  );
};

/*

Thanks:
https://sdorra.dev/posts/2022-11-17-dark-mode-with-next

*/

type SettingsProps = {
  fileEditorState: FileEditorState;
  mainStateDispatch: MainStateDispatch;
  settings: MainState["settings"];
};

export const Settings = ({
  fileEditorState,
  mainStateDispatch,
  settings,
}: SettingsProps) => {
  const { siteTheme, toggleSiteTheme } = useTheme();

  const onThemeSwitchClick = () => {
    toggleSiteTheme();
  };

  const handleApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    mainStateDispatch({ type: "SET_OPENAI_API_KEY", payload: e.target.value });
  };

  return (
    <Modal
      isOpen
      closeActionCallback={() => {
        mainStateDispatch({ type: "TOGGLE_SETTINGS" });
      }}
      overlayClassNames="bg-black bg-opacity-10"
      className="w-[600px]"
    >
      <SettingsSection title="Theme">
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
      </SettingsSection>

      <SettingsSection title="LLM Settings">
        <div className="flex flex-col space-y-4">
          <div>
            <form>
              <label htmlFor="OpenAIAPIKey">OpenAI API Key:</label>
              <input
                type="password"
                name="OpenAI API Key"
                id="OpenAIAPIKey"
                value={settings.openAIAPIKey}
                onChange={handleApiChange}
                className="ml-2 border border-gray-300 px-2 py-1 bg-secondary-colors"
                // Not sure if the autoComplete prop does anything.
                autoComplete="on"
              />
            </form>
          </div>

          <div className="text-red-500">
            WARNING - Setting an API key here is not recommended. If your
            browser is compromised, attackers can potentially steal your API
            key. The recommended way to use this is to clone the github repo
            locally and set your API key in a .env.local file.
          </div>
        </div>
      </SettingsSection>
    </Modal>
  );
};
