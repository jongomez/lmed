"use client";

import {
  KeyboardShortcutAction,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import { PencilIcon } from "lucide-react";
import { useState } from "react";
import { useRecordHotkeys } from "react-hotkeys-hook";
import { Button } from "../base/Button.server";
import { Input } from "../base/Input.server";
import { A } from "../base/Links.server";
import { P } from "../base/Typography.server";

type KeyboardShortcutEditOverlayProps = {
  onClick: () => void;
};

const KeyboardShortcutEditOverlay = ({
  onClick,
}: KeyboardShortcutEditOverlayProps) => {
  return (
    <div
      onClick={onClick}
      className="fixed top-0 left-0 w-full h-full z-50 bg-black opacity-50"
    ></div>
  );
};

type KeyboardShortcutSettingsProps = {
  keyboardShortcuts: MainState["settings"]["keyboardShortcuts"];
  mainStateDispatch: MainStateDispatch;
};

export const KeyboardShortcutSettings = ({
  keyboardShortcuts,
  mainStateDispatch,
}: KeyboardShortcutSettingsProps) => {
  const [keys, { start, stop, isRecording }] = useRecordHotkeys();
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const handleEdit = (key: string) => {
    setEditingKey(key);
    start();
  };

  const exitEditMode = () => {
    stop();
    setEditingKey(null);
  };

  const handleClear = () => {
    // Stop will also clear the keyboard shortcut input box. Then we can start again.
    stop();
    start();
  };

  const handleSave = () => {
    if (editingKey) {
      mainStateDispatch({
        type: "SET_KEYBOARD_SHORTCUT",
        payload: {
          keyboardShortcutAction: editingKey as KeyboardShortcutAction,
          keys: Array.from(keys).join("+"),
        },
      });
    }

    exitEditMode();
  };

  const editButtonClasses = "m-2 inline w-40";

  return (
    <>
      {Object.keys(keyboardShortcuts).map((key: string) => (
        <div key={key as string}>
          {editingKey === key && isRecording ? (
            <>
              <KeyboardShortcutEditOverlay onClick={exitEditMode} />

              <div
                className="z-[9999] relative flex 
                flex-col items-center focus-border rounded-lg
                bg-main-colors
                "
              >
                <P>
                  {key}: <Input value={Array.from(keys).join("+")} readOnly />
                </P>

                <div className="flex justify-center">
                  <Button onClick={handleClear} className={editButtonClasses}>
                    Clear
                  </Button>
                  <Button onClick={handleSave} className={editButtonClasses}>
                    Save
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <P>
                {key}:
                <A
                  className="ml-2 inline-flex items-center"
                  onClick={() => handleEdit(key)}
                >
                  {keyboardShortcuts[key as KeyboardShortcutAction]}
                  <PencilIcon size={16} className="ml-1" />
                </A>
              </P>
            </>
          )}
        </div>
      ))}

      <P>
        More codemirror shortcuts at:{" "}
        <A href="https://codemirror.net/docs/ref/#commands" target="_blank">
          https://codemirror.net/docs/ref/#commands
        </A>
      </P>
    </>
  );
};
