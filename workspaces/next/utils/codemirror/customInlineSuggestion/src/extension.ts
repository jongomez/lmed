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
  Command,
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
  startPos: null | number;
}>({
  create() {
    return { suggestion: null, startPos: null };
  },

  // tr is the transaction that represents the state change.
  update(value, tr: Transaction) {
    const clearInlineSuggestion = tr.effects.find((e) =>
      e.is(ClearInlineSuggestionEffect)
    );

    if (clearInlineSuggestion) {
      return { suggestion: null, startPos: null };
    }

    const inlineSuggestion = tr.effects.find((e) =>
      e.is(InlineSuggestionEffect)
    );

    const currentLineText = tr.state.doc.lineAt(
      tr.state.selection.main.from
    ).text;

    // if (inlineSuggestion) {
    //   debugger;
    // }

    // If an inline suggestion is found and it corresponds to the current document.
    if (inlineSuggestion && tr.state.doc == inlineSuggestion.value.doc) {
      const leadingWhiteSpaceLen =
        currentLineText.length - currentLineText.trimStart().length;

      // Try to match the suggestion with existing text in the current line.
      // e.g. suggestion is "Hello World!" and current line is "Hello" - start pos is at the end of "Hello"
      let startPos = inlineSuggestion.value.text.indexOf(
        currentLineText.trimStart()
      );

      if (startPos === -1) {
        // If the suggestion is not a part of the current line, return suggestion with startPos as current cursor position
        startPos = tr.state.selection.main.from;
      } else {
        // Adjust startPos to the global position in the document
        const lineStartPos = tr.state.doc.lineAt(
          tr.state.selection.main.from
        ).from;
        startPos += lineStartPos + leadingWhiteSpaceLen;
      }

      return { suggestion: inlineSuggestion.value.text, startPos: startPos };
    }

    // If the document hasn't changed, keep the previous suggestion.
    if (!tr.docChanged) {
      return value;
    }

    const suggestionStart = value.suggestion?.startsWith(
      currentLineText.trimStart()
    );

    // If the suggestion starts with what the user has typed in, don't reset the suggestion.
    // e.g. the suggestion is "Hello World", and the user has typed in "Hello W" - don't clear suggestion.
    if (suggestionStart) {
      return value;
    }

    // Otherwise, reset the suggestion.
    return { suggestion: null, startPos: null };
  },
});

export const InlineSuggestionEffect = StateEffect.define<{
  text: string | null;
  doc: Text;
}>();

export const ClearInlineSuggestionEffect = StateEffect.define<null>();

export function inlineSuggestionDecoration(
  view: EditorView,
  suggestionText: string,
  suggestionStartPos: number
) {
  const currentCursorPos = view.state.selection.main.from;
  //const currentCursorPos = view.state.selection.main.head;
  const line = view.state.doc.lineAt(currentCursorPos);

  // If the cursor is behind the start of the suggestion, clear the suggestion
  if (currentCursorPos < suggestionStartPos) {
    return Decoration.none;
  }

  // Add a check if the cursor is still in the same line as the suggestion
  const suggestionLine = view.state.doc.lineAt(suggestionStartPos);
  if (suggestionLine.number !== line.number) {
    return Decoration.none;
  }

  // The alreadyTypedAmount tells us how much of the suggestion has already been typed.
  const alreadyTypedAmount = currentCursorPos - suggestionStartPos;

  if (alreadyTypedAmount >= suggestionText.length) {
    // If the cursor is past the end of the suggestion, we no longer need to show the suggestion.
    return Decoration.none;
  }

  const suggestionLeftToType = suggestionText.substring(alreadyTypedAmount);

  const inlineSuggestion = Decoration.widget({
    widget: new InlineSuggestionWidget(suggestionLeftToType),
    side: 1,
  });

  const adjustedSuggestionStartPos = suggestionStartPos + alreadyTypedAmount;

  // console.log("suggestionText.length", suggestionText.length);
  // console.log("suggestionLeftToType.length", suggestionLeftToType.length);
  // console.log("suggestionLeftToType", suggestionLeftToType);
  // console.log("adjustedSuggestionStartPos", adjustedSuggestionStartPos);

  return Decoration.set([inlineSuggestion.range(adjustedSuggestionStartPos)]);
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

      // console.log("Changes: ", update?.changes);
      // console.log(
      //   "transactions[0].effects: ",
      //   update.transactions?.[0].effects
      // );
      // console.log("Annotation: ", update.transactions?.[0].annotation);

      // debugger;

      const suggestionText = update.state.field(
        InlineSuggestionState
      )?.suggestion;

      const suggestionStartPosition = update.state.field(
        InlineSuggestionState
      )?.startPos;

      if (!suggestionText || suggestionStartPosition === null) {
        this.decorations = Decoration.none;
        return;
      }

      this.decorations = inlineSuggestionDecoration(
        update.view,
        suggestionText,
        suggestionStartPosition
      );
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// This is called when the insertion keymap shortcut is called (default is "Tab").
// This is what replaces the suggestion with actual text. So this assumes a suggestion was already fetched.
export function insertInlineSuggestionText(
  state: EditorState, // The current editor state.
  suggestionText: string, // The text to be inserted.
  from: number // The position to start inserting the text.
): TransactionSpec {
  // Create a new transaction from the state to make changes.
  const tr = state.update({
    // Insert the suggestion text at the 'from' position.
    changes: { from: from, insert: suggestionText },
    // Move the cursor to the end of the inserted suggestion.
    selection: EditorSelection.cursor(from + suggestionText.length),
    // Annotating this change as a user event of accepting an inline suggestion.
    userEvent: "inlineSuggestionAccepted",
  });

  return tr;
}

export const clearInlineSuggestion: Command = (view: EditorView) => {
  view.dispatch({ effects: ClearInlineSuggestionEffect.of(null) });

  return true;
};
