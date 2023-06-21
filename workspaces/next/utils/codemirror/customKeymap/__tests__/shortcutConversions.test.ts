import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  KeyboardShortcutsObj,
  convertKeyboardShortcutToCodemirrorKeymap,
} from "../src";

describe("convertKeyboardShortcutToCodemirrorKeymap", () => {
  let testShortcuts: KeyboardShortcutsObj;

  beforeEach(() => {
    testShortcuts = {
      "Save File": "ctrl+s",
      "Open File": "ctrl+o",
      Undo: "ctrl+z",
      Redo: "ctrl+y",
      "Select All": "ctrl+a",
      "Go to Top": "ctrl+home",
      "Go to Bottom": "ctrl+end",
    };
  });

  it("should correctly convert shortcuts to Codemirror format", () => {
    const result = convertKeyboardShortcutToCodemirrorKeymap(testShortcuts);
    expect(result["Save File"]).toBe("Ctrl-s");
    expect(result["Open File"]).toBe("Ctrl-o");
    expect(result["Undo"]).toBe("Ctrl-z");
    expect(result["Redo"]).toBe("Ctrl-y");
    expect(result["Select All"]).toBe("Ctrl-a");
    expect(result["Go to Top"]).toBe("Ctrl-Home");
    expect(result["Go to Bottom"]).toBe("Ctrl-End");
  });

  it("should not modify the original object", () => {
    const original = { ...testShortcuts };
    convertKeyboardShortcutToCodemirrorKeymap(testShortcuts);
    expect(testShortcuts).toEqual(original);
  });
});
