import { EditorView } from "@codemirror/view";
import { describe, expect, it } from "@jest/globals";

import { InlineSuggestionEffect } from "../src";
import {
  InlineSuggestionState,
  insertInlineSuggestionText,
} from "../src/extension";
import { getTestEditorView } from "./stateAndDecoration.test";

// TODO: More tests please.

describe.only("applyInlineSuggestion", () => {
  let view: EditorView;

  beforeEach(() => {
    // Create an editor view with the plugin.
    view = getTestEditorView();

    // Initially, there should be no decorations
    expect(view.dom.querySelector(".cm-inline-suggestion")).toBeNull();
  });

  it("should insert suggestion text at the cursor", () => {
    // Dispatch an effect with the suggestion text
    const suggestionText = "Hello, world!";

    view.dispatch({
      effects: InlineSuggestionEffect.of({
        text: suggestionText,
        doc: view.state.doc,
      }),
    });

    // Execute the function
    const suggestion = view.state.field(InlineSuggestionState);

    if (
      suggestion.text === null ||
      suggestion.startPos === null ||
      suggestion.startLine === null
    ) {
      throw new Error("suggestion.text is null");
    }

    const transaction = insertInlineSuggestionText(
      view.state,
      suggestion.text,
      suggestion.startPos,
      suggestion.startLine
    );
    view.dispatch(transaction);

    // The suggestion text should now be inserted at the cursor
    expect(view.state.doc.toString()).toContain(suggestionText);
  });
});
