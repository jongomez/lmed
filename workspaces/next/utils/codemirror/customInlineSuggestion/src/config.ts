import { EditorState, Facet } from "@codemirror/state";
import { debouncePromise } from "./utils";

export interface InlineSuggestionConfig {
  // The function that fetches the inline suggestion.
  fetchFn: (state: EditorState) => Promise<string>;
  // Automatic mode: Fetches the inline suggestion whenever there's a change in the document, e.g. when
  // the user types something.
  // Manual mode: Fetches the inline suggestion only when the user presses a keyboard shortcut.
  // Default manual mode fetch shortcut is Ctrl-Enter.
  mode: "manual" | "automatic";
  // For automatic mode, delayBeforeFetching determines the delay between the user typing something
  // on the editor, and the inline suggestion extension fetching a suggestion.
  // For manual mode, delayBeforeFetching is ignored.
  delayBeforeFetching?: number;
}

export const inlineSuggestionConfig = Facet.define<
  InlineSuggestionConfig,
  InlineSuggestionConfig
>({
  combine(configs) {
    const defaultDelayBeforeFetching = 1000;

    // If no config is provided, use the last one (or the default one).
    const config = configs.length
      ? configs[configs.length - 1]
      : {
          fetchFn: async (state: EditorState) => "",
          mode: "manual" as const,
          delayBeforeFetching: defaultDelayBeforeFetching,
        };

    // Apply debouncing to the fetchFn if the mode is 'automatic'.
    if (config.mode === "automatic") {
      config.fetchFn = debouncePromise(
        config.fetchFn,
        config.delayBeforeFetching || defaultDelayBeforeFetching
      );
    }

    return config;
  },
});
