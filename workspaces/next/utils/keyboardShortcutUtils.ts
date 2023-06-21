import { KeyboardShortcutAction, MainStateDispatch } from "@/types/MainTypes";
import { HotkeysEvent } from "react-hotkeys-hook/dist/types";

const modifiers = ["alt", "ctrl", "meta", "shift", "mod"] as const;
// type ModifiersTuple = typeof modifiers; // readonly ["alt", "ctrl", "meta", "shift", "mod"]
// type Modifier = ModifiersTuple[number];

export const shortcutsMatch = (
  existingShortcutKeysArray: string[],
  pressedShortcutKeysArray: string[]
): boolean => {
  if (
    existingShortcutKeysArray.sort().join(",") ===
    pressedShortcutKeysArray.sort().join(",")
  ) {
    return true;
  } else {
    return false;
  }
};

export const getShortcutAction = (
  hotkeysEvent: HotkeysEvent,
  keyboardShortcuts: Record<KeyboardShortcutAction, string>
): string => {
  let shortcutAction = "";
  let pressedShortcutKeysArray: string[] = hotkeysEvent.keys || [];

  for (const modifier of modifiers) {
    // Check if the keyboard shortcut pressed contains any modifiers.
    if (hotkeysEvent[modifier]) {
      pressedShortcutKeysArray.push(modifier);
    }
  }

  for (const [action, shortcut] of Object.entries(keyboardShortcuts)) {
    const existingShortcutKeysArray = shortcut.split("+");

    if (shortcutsMatch(existingShortcutKeysArray, pressedShortcutKeysArray)) {
      shortcutAction = action;
    }
  }

  if (!shortcutAction) {
    console.error("No shortcut action found for", hotkeysEvent.keys);
    return "";
  }

  return shortcutAction;
};

export const keyboardShortcutsHandler = (
  hotkeysEvent: HotkeysEvent,
  keyboardShortcuts: Record<KeyboardShortcutAction, string>,
  mainStateDispatch: MainStateDispatch
) => {
  // Whenever a keyboard shortcut is pressed, this is called.
  let shortcutAction = getShortcutAction(hotkeysEvent, keyboardShortcuts);

  switch (shortcutAction) {
    case "Save File":
      break;
    case "Get Inline Suggestion":
      // This shortcut is handled by codemirror, so no need to do anything here.
      break;
  }
};
