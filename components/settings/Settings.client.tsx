"use client";

import {
  EditorSettings,
  FileEditorState,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { useTheme } from "@/utils/hooks/randomHooks";
import { Moon, Sun } from "lucide-react";
import { ReactNode } from "react";
import { Modal } from "../base/Modal.client";
import { RadioItem } from "../base/RadioItem.server";
import { H3 } from "../base/Typography.server";
import { KeyboardShortcutSettings } from "./KeyboardShortcutSettings.client";

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
  isSettingsActive: boolean;
};

export const Settings = ({
  fileEditorState,
  mainStateDispatch,
  settings,
  isSettingsActive,
}: SettingsProps) => {
  const { siteTheme, toggleSiteTheme } = useTheme();
  const selectedKeyBindings = settings.editorSettings.keyBindings;

  const onThemeSwitchClick = () => {
    toggleSiteTheme();
  };

  const handleApiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    mainStateDispatch({ type: "SET_OPENAI_API_KEY", payload: e.target.value });
  };

  const handleKeyBindings = (keyBindings: EditorSettings["keyBindings"]) => {
    mainStateDispatch({ type: "SET_KEY_BINDINGS", payload: keyBindings });
  };

  return (
    <Modal
      isOpen
      closeActionCallback={() => {
        mainStateDispatch({ type: "TOGGLE_SETTINGS" });
      }}
      overlayClassNames={`${
        isSettingsActive ? "" : "hidden"
      } bg-black bg-opacity-10`}
      className={`${isSettingsActive ? "" : "hidden"} w-[600px] `}
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

      <SettingsSection title="Key Bindings">
        <div className="flex">
          <RadioItem
            onChange={() => handleKeyBindings("default")}
            checked={selectedKeyBindings === "default"}
            label="Default"
          />
          <RadioItem
            onChange={() => handleKeyBindings("vim")}
            checked={selectedKeyBindings === "vim"}
            label="Vim"
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Keyboard Shortcuts">
        <KeyboardShortcutSettings
          mainStateDispatch={mainStateDispatch}
          keyboardShortcuts={settings.keyboardShortcuts}
        />
      </SettingsSection>

      <SettingsSection title="LLM Settings">
        <div className="flex flex-col space-y-4">
          <div>
            <form>
              <label htmlFor="OpenAIAPIKey">OpenAI API Key</label>
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
