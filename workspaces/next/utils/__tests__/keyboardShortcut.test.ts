import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { HotkeysEvent } from "react-hotkeys-hook/dist/types";
import { getShortcutAction } from "../keyboardShortcutUtils";

// Mock the functions called by keyboardShortcutsHandler
const saveFile = jest.fn();
const getInlineSuggestion = jest.fn();

beforeEach(() => {
  jest.clearAllMocks(); // Clear all mocks before each test
});

describe("getShortcutAction", () => {
  it("returns action for a shortcut with 1 modifier", () => {
    const keyboardShortcuts: Record<string, string> = {
      "Save File": "ctrl+s",
    };

    const hotkeysEvent: HotkeysEvent = {
      ctrl: true,
      keys: ["s"],
    };

    const result = getShortcutAction(hotkeysEvent, keyboardShortcuts);

    expect(result).toBe("Save File");
  });

  it("returns action for a shortcut with 2 modifiers", () => {
    const keyboardShortcuts: Record<string, string> = {
      "Save File": "ctrl+alt+s",
    };

    const hotkeysEvent: HotkeysEvent = {
      ctrl: true,
      alt: true,
      keys: ["s"],
    };

    const result = getShortcutAction(hotkeysEvent, keyboardShortcuts);

    expect(result).toBe("Save File");
  });

  it.only("returns empty string for invalid shortcut", () => {
    const keyboardShortcuts: Record<string, string> = {
      "Save File": "ctrl+s",
    };

    const hotkeysEvent: HotkeysEvent = {
      ctrl: true,
      keys: ["x"], // 'ctrl+x' is not a valid shortcut
    };

    const logSpy = jest.spyOn(console, "error");

    const result = getShortcutAction(hotkeysEvent, keyboardShortcuts);

    expect(result).toBe("");
    expect(logSpy).toHaveBeenCalledWith(
      "No shortcut action found for",
      hotkeysEvent.keys
    );

    logSpy.mockRestore(); // Restore console.error after the test
  });
});
