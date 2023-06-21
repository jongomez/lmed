import { KeyboardShortcutAction } from "@/types/MainTypes";
import { Extension, Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { shortcutFetch } from "../../customInlineSuggestion/src";

export type KeyboardShortcutsObj = Record<string, string>;

const keymapConversion: Record<string, string> = {
  ctrl: "Ctrl",
  alt: "Alt",
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  pageup: "PageUp",
  pagedown: "PageDown",
  home: "Home",
  end: "End",
  enter: "Enter",
  backspace: "Backspace",
  delete: "Delete",
  insert: "Insert",
  cmd: "Cmd",
};

export const convertKeyboardShortcutToCodemirrorKeymap = (
  keyboardShortcuts: KeyboardShortcutsObj
): KeyboardShortcutsObj => {
  let convertedShortcuts: KeyboardShortcutsObj = { ...keyboardShortcuts };
  const actions = Object.keys(keyboardShortcuts) as KeyboardShortcutAction[];

  for (let action of actions) {
    let keysInShortcut = keyboardShortcuts[action].split("+");

    keysInShortcut = keysInShortcut.map(
      (key: string) => keymapConversion[key] || key
    );

    convertedShortcuts[action] = keysInShortcut.join("-");
  }

  return convertedShortcuts;
};

/// Returns an extension that enables autocompletion.
export function customKeymap(
  keyboardShortcuts: KeyboardShortcutsObj
): Extension {
  const convertedShortcuts =
    convertKeyboardShortcutToCodemirrorKeymap(keyboardShortcuts);
  return [customKeymapExtension(convertedShortcuts)];
}

export const customKeymapExtension = (
  keyboardShortcuts: KeyboardShortcutsObj
): Extension => {
  let inlineSuggestion = keyboardShortcuts["Get Inline Suggestion"];
  // inlineSuggestion = "Ctrl-b";
  // console.log("inlineSuggestion", inlineSuggestion);

  return Prec.highest(
    keymap.of([{ key: inlineSuggestion, run: shortcutFetch }])
  );
};
