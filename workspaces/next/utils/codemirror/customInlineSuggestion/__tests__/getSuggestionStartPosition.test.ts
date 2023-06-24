import { describe, expect, it } from "@jest/globals";
import { getSuggestionStartPosition } from "../src/utils";

describe.only("getSuggestionStartPosition function", () => {
  it("Should return null when the suggestion text is null or undefined", () => {
    const inlineSuggestion = { text: null, startPos: 0, startLine: 0 };
    const currentLineText = "Hello World";

    const result = getSuggestionStartPosition(
      currentLineText,
      inlineSuggestion
    );

    expect(result).toBeNull();
  });

  it("Should return null when the line already has the suggestion", () => {
    const inlineSuggestion = { text: "Hello World", startPos: 0, startLine: 0 };
    const currentLineText = "Hello World";

    const result = getSuggestionStartPosition(
      currentLineText,
      inlineSuggestion
    );

    expect(result).toEqual(null);
  });

  it("Should return 0 when the line starts with the suggestion text", () => {
    const inlineSuggestion = { text: "Hello World", startPos: 0, startLine: 0 };
    const currentLineText = "Hello";

    const result = getSuggestionStartPosition(
      currentLineText,
      inlineSuggestion
    );

    expect(result).toEqual(0);
  });

  it("Should return the leading whitespace length when the trimmed line starts with the suggestion text", () => {
    const inlineSuggestion = { text: "Hello World", startPos: 0, startLine: 0 };
    const currentLineText = "     Hello";

    const result = getSuggestionStartPosition(
      currentLineText,
      inlineSuggestion
    );

    const emptySpaceLength =
      currentLineText.length - currentLineText.trimStart().length;

    expect(result).toEqual(emptySpaceLength);
  });

  it("Should return line length when the line does not start with the suggestion text", () => {
    const inlineSuggestion = { text: "World Hello", startPos: 0, startLine: 0 };
    const currentLineText = "Hello";

    const result = getSuggestionStartPosition(
      currentLineText,
      inlineSuggestion
    );

    expect(result).toEqual(currentLineText.length);
  });
});
