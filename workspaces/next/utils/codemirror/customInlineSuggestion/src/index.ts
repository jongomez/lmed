import { Extension } from "@codemirror/state";
import {
  InlineSuggestionEffect,
  InlineSuggestionState,
  automaticFetchSuggestion,
  clearInlineSuggestion,
  insertCompletionText,
  renderInlineSuggestionPlugin,
} from "./extension";

import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { InlineSuggestionConfig, inlineSuggestionConfig } from "./config";

export const shortcutFetch = (view: EditorView) => {
  console.log("Ctrl-Enter has been pressed.");

  let fetchFn = view.state.facet(inlineSuggestionConfig).fetchFn;

  fetchFn(view.state).then((llmResponse: string) => {
    console.log(
      "Ctrl-Enter's own fetchFn has resolved with value:",
      llmResponse
    );

    view.dispatch({
      effects: InlineSuggestionEffect.of({
        text: llmResponse,
        doc: view.state.doc,
      }),
    });
  });

  return true;
};

export const inlineSuggestionKeymap = Prec.highest(
  keymap.of([
    {
      key: "Tab",
      run: (view) => {
        const suggestionText = view.state.field(
          InlineSuggestionState
        )?.suggestion;

        // If there is no suggestion, do nothing and let the default keymap handle it.
        if (!suggestionText) {
          return false;
        }

        view.dispatch({
          ...insertCompletionText(
            view.state,
            suggestionText,
            view.state.selection.main.head,
            view.state.selection.main.head
          ),
        });

        return true;
      },
    },
    {
      key: "Ctrl-Enter",
      run: shortcutFetch,
    },
    {
      key: "Esc",
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
