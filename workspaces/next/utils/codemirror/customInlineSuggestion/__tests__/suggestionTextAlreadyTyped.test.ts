import { describe, expect, it } from "@jest/globals";
import { suggestionTextAlreadyTyped } from "../src/utils";

describe("suggestionTextAlreadyTyped function", () => {
  it("Should return nulls when suggestionStartPos is greater than currentLineText length", () => {
    const suggestionText = "Hello";
    const suggestionStartPos = 10;
    const currentLineText = "World";

    const result = suggestionTextAlreadyTyped(
      suggestionText,
      suggestionStartPos,
      currentLineText
    );

    expect(result).toEqual({ alreadyTyped: null, leftToType: null });
  });

  it("Should return the correct already typed and left to type text", () => {
    const suggestionText = "Hello World";
    const suggestionStartPos = 0;
    const currentLineText = "Hello";

    const result = suggestionTextAlreadyTyped(
      suggestionText,
      suggestionStartPos,
      currentLineText
    );

    expect(result).toEqual({ alreadyTyped: "Hello", leftToType: " World" });
  });

  it("Should return nulls when the suggestion does not start with the current line text", () => {
    const suggestionText = "World";
    const suggestionStartPos = 0;
    const currentLineText = "Hello";

    const result = suggestionTextAlreadyTyped(
      suggestionText,
      suggestionStartPos,
      currentLineText
    );

    expect(result).toEqual({ alreadyTyped: null, leftToType: null });
  });
});
