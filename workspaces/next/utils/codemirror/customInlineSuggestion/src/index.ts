import { Extension, Prec, StateEffect, Text } from "@codemirror/state";
import { Command, EditorView, keymap } from "@codemirror/view";
import { InlineSuggestionConfig, inlineSuggestionConfig } from "./config";
import {
  InlineSuggestionState,
  automaticFetchSuggestion,
  insertInlineSuggestionText,
  renderInlineSuggestionPlugin,
} from "./extension";

export type InlineSuggestion = {
  text: string | null; // this is the actual text of the suggestion.
  startPos: number | null; // this is the relative position of the suggestion text in it's startLine.
  startLine: number | null; // 1 based value of the line number where the suggestion starts.
};

export const ClearInlineSuggestionEffect = StateEffect.define<null>();

export const InlineSuggestionEffect = StateEffect.define<{
  text: string | null;
  doc: Text;
}>();

export const clearInlineSuggestion: Command = (view: EditorView) => {
  view.dispatch({ effects: ClearInlineSuggestionEffect.of(null) });

  return true;
};

export const shortcutFetch = (view: EditorView) => {
  let fetchFn = view.state.facet(inlineSuggestionConfig).fetchFn;

  fetchFn(view.state).then((llmResponse: string) => {
    // console.log(
    //   "shortcutFetch's own fetchFn has resolved with value:",
    //   llmResponse
    // );

    view.dispatch({
      effects: InlineSuggestionEffect.of({
        text: llmResponse,
        doc: view.state.doc,
      }),
    });
  });

  return true;
};

export const applyInlineSuggestion = (view: EditorView) => {
  const { text, startPos, startLine } = view.state.field(InlineSuggestionState);

  // If there is no suggestion, do nothing and let the default keymap handle it.
  if (!text || startPos === null || startLine === null) {
    return false;
  }

  try {
    view.dispatch({
      ...insertInlineSuggestionText(view.state, text, startPos, startLine),
    });

    clearInlineSuggestion(view);
  } catch (e) {
    console.error("Error calling insertInlineSuggestionText", e);
    clearInlineSuggestion(view);
  }

  return true;
};

export const inlineSuggestionKeymap = Prec.highest(
  keymap.of([
    {
      key: "Tab",
      run: applyInlineSuggestion,
    },
    {
      key: "Ctrl-Enter",
      run: shortcutFetch,
    },
    {
      key: "Escape",
      run: clearInlineSuggestion,
    },
  ])
);

export function inlineSuggestion(config: InlineSuggestionConfig): Extension {
  return [
    InlineSuggestionState,
    inlineSuggestionConfig.of(config),
    automaticFetchSuggestion,
    renderInlineSuggestionPlugin,
    inlineSuggestionKeymap,
  ];
}
