import {
  EditorSelection,
  EditorState,
  StateEffect,
  StateField,
  Text,
  Transaction,
  TransactionSpec,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { inlineSuggestionConfig } from "./config";

// Current state of the autosuggestion. Basically holds the suggestion text.
export const InlineSuggestionState = StateField.define<{
  suggestion: null | string;
}>({
  create() {
    return { suggestion: null };
  },

  // tr is the transaction that represents the state change.
  update(__, tr: Transaction) {
    const inlineSuggestion = tr.effects.find((e) =>
      e.is(InlineSuggestionEffect)
    );

    // Updates the suggestion whenever a InlineSuggestionEffect is found in the transaction.
    if (tr.state.doc) {
      if (inlineSuggestion) {
        debugger;
      }

      if (inlineSuggestion && tr.state.doc == inlineSuggestion.value.doc) {
        return { suggestion: inlineSuggestion.value.text };
      }
    }

    return { suggestion: null };
  },
});

export const InlineSuggestionEffect = StateEffect.define<{
  text: string | null;
  doc: Text;
}>();

export function inlineSuggestionDecoration(view: EditorView, prefix: string) {
  const pos = view.state.selection.main.head;
  const widgets = [];
  const w = Decoration.widget({
    widget: new InlineSuggestionWidget(prefix),
    side: 1,
  });
  widgets.push(w.range(pos));
  return Decoration.set(widgets);
}

export class InlineSuggestionWidget extends WidgetType {
  suggestion: string;
  constructor(suggestion: string) {
    super();
    this.suggestion = suggestion;
  }
  toDOM() {
    const div = document.createElement("span");
    div.style.opacity = "0.4";
    div.className = "cm-inline-suggestion";
    div.textContent = this.suggestion;
    return div;
  }
}

export const automaticFetchSuggestion = ViewPlugin.fromClass(
  class Plugin {
    async update(update: ViewUpdate) {
      let fetchFn = update.state.facet(inlineSuggestionConfig).fetchFn;
      let mode = update.state.facet(inlineSuggestionConfig).mode;

      // This is where we fetch the inline suggestion.
      // NOTE: This gets called every time there's an update on the codemirror editor.
      // WARNING: Even for window resizes, this gets called.
      // console.log("update", update);

      // On manual mode, we will not fetch whenever there's a change in the document.
      // Instead, we will only fetch when the user presses the keyboard shortcut to fetch a suggestion.
      if (mode === "manual") {
        return;
      }

      const doc = update.state.doc;
      // Only fetch if the document has changed
      if (!update.docChanged) {
        return;
      }

      const result = await fetchFn(update.state);
      update.view.dispatch({
        effects: InlineSuggestionEffect.of({ text: result, doc: doc }),
      });
    }
  }
);

// This is what displays the actual inline suggestions.
export const renderInlineSuggestionPlugin = ViewPlugin.fromClass(
  class Plugin {
    decorations: DecorationSet;
    constructor() {
      // Empty decorations
      this.decorations = Decoration.none;
    }
    update(update: ViewUpdate) {
      // This is where we display the inline suggestion.
      // NOTE: This gets called every time there's an update on the codemirror editor.

      console.log("Changes: ", update.changes);
      console.log("Effects: ", update.transactions[0].effects);
      console.log("Annotation: ", update.transactions[0].annotation);

      debugger;

      const suggestionText = update.state.field(
        InlineSuggestionState
      )?.suggestion;

      if (!suggestionText) {
        this.decorations = Decoration.none;
        return;
      }

      this.decorations = inlineSuggestionDecoration(
        update.view,
        suggestionText
      );
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

export function insertCompletionText(
  state: EditorState,
  text: string,
  from: number,
  to: number
): TransactionSpec {
  return {
    ...state.changeByRange((range) => {
      if (range == state.selection.main)
        return {
          changes: { from: from, to: to, insert: text },
          range: EditorSelection.cursor(from + text.length),
        };
      const len = to - from;
      if (
        !range.empty ||
        (len &&
          state.sliceDoc(range.from - len, range.from) !=
            state.sliceDoc(from, to))
      )
        return { range };
      return {
        changes: { from: range.from - len, to: range.from, insert: text },
        range: EditorSelection.cursor(range.from - len + text.length),
      };
    }),
    userEvent: "input.complete",
  };
}
