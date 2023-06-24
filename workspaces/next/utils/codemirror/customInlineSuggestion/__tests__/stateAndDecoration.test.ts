import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { beforeEach, describe, expect, it } from "@jest/globals";

import { InlineSuggestionEffect, inlineSuggestion } from "../src";
import { InlineSuggestionState } from "../src/extension";

const suggestionText = "Hello, world!";

const fetchCallback = (editorState: EditorState): Promise<string> => {
  return Promise.resolve(suggestionText);
};

const dispatchInlineSuggestionEffect = (
  view: EditorView,
  suggestionTextOverride?: string
) => {
  // Dispatch an effect with the suggestion text
  view.dispatch({
    effects: InlineSuggestionEffect.of({
      text: suggestionTextOverride || suggestionText,
      doc: view.state.doc,
    }),
  });
};

describe("state and decoration tests", () => {
  let view: EditorView;

  beforeEach(() => {
    // Create an editor view with the plugin.
    view = new EditorView({
      state: EditorState.create({
        extensions: inlineSuggestion({
          fetchFn: fetchCallback,
          mode: "manual",
        }),
      }),
    });

    // Initially, there should be no decorations
    expect(view.dom.querySelector(".cm-inline-suggestion")).toBeNull();
  });

  it("should update suggestion on InlineSuggestionEffect", () => {
    dispatchInlineSuggestionEffect(view);

    // The suggestion should now be updated in the state
    const suggestion = view.state.field(InlineSuggestionState);
    expect(suggestion).not.toBeNull();
    expect(suggestion.text).toBe(suggestionText);
  });

  it("empty document - should display the whole inline suggestion", () => {
    dispatchInlineSuggestionEffect(view);

    // Now there should be a decoration with the suggestion text
    let decoration = view.dom.querySelector(".cm-inline-suggestion");
    expect(decoration).not.toBeNull();
    expect(decoration!.textContent).toBe(suggestionText);
  });

  it("partially complete suggestion - should display partial inline suggestion", () => {
    // Replace the entire content with 'Hello'
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: "Hello" },
    });

    // Then dispatch the InlineSuggestionEffect
    dispatchInlineSuggestionEffect(view);

    // Now there should be a decoration with the remaining part of the suggestion text
    let decoration = view.dom.querySelector(".cm-inline-suggestion");
    expect(decoration).not.toBeNull();
    expect(decoration!.textContent).toBe(", world!");
  });

  it.only("partially complete multiline suggestion - should display partial multiline suggestion", () => {
    // Replace the entire content with 'Hello'
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: "Hello" },
    });

    // Then dispatch the InlineSuggestionEffect
    dispatchInlineSuggestionEffect(
      view,
      "Hello,\nworld! This is a\nmultiline suggestion."
    );

    // Now there should be a decoration with the remaining part of the suggestion text
    let decoration = view.dom.querySelector(".cm-inline-suggestion");

    console.log(decoration);

    console.log(decoration?.textContent);

    expect(decoration).not.toBeNull();
    expect(decoration!.textContent).toBe(
      ",\nworld! This is a\nmultiline suggestion."
    );
  });

  dispatchInlineSuggestionEffect;
});
