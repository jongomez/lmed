import {
  EditorSelection,
  EditorState,
  StateField,
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
import {
  ClearInlineSuggestionEffect,
  InlineSuggestion,
  InlineSuggestionEffect,
} from ".";
import { inlineSuggestionConfig } from "./config";
import {
  getAdjustedSuggestionStartPos,
  getSuggestionStartPosition,
  suggestionTextAlreadyTyped,
} from "./utils";

// Current state of the autosuggestion. Basically holds the suggestion text.
export const InlineSuggestionState = StateField.define<InlineSuggestion>({
  create() {
    return { text: null, startPos: null, startLine: null };
  },

  // tr is the transaction that represents the state change.
  update(currentSuggestion: InlineSuggestion, tr: Transaction) {
    const nullResult: InlineSuggestion = {
      text: null,
      startPos: null,
      startLine: null,
    };

    const clearInlineSuggestion = tr.effects.find((e) =>
      e.is(ClearInlineSuggestionEffect)
    );

    if (clearInlineSuggestion) {
      return nullResult;
    }

    const { text: currentLineText, number: currentLineNumber } =
      tr.state.doc.lineAt(tr.state.selection.main.from);

    const inlineSuggestionEffect = tr.effects.find((e) =>
      e.is(InlineSuggestionEffect)
    );

    // if (inlineSuggestionEffect) debugger;

    // If an inline suggestion is found and it corresponds to the current document.
    // XXX: Maybe the document equality thing is not necessary?
    if (
      inlineSuggestionEffect &&
      tr.state.doc == inlineSuggestionEffect.value.doc
    ) {
      const startPos = getSuggestionStartPosition(
        currentLineText,
        inlineSuggestionEffect.value
      );

      return {
        text: inlineSuggestionEffect.value.text,
        startPos: startPos,
        startLine: currentLineNumber,
      };
    }

    // Clear the suggestion if the cursor is in a different line from the suggestion's initial line.
    if (currentSuggestion.startLine !== currentLineNumber) {
      return nullResult;
    }

    // If the document hasn't changed, keep the previous suggestion.
    if (!tr.docChanged) {
      return currentSuggestion;
    }

    // If there is no suggestion so far, return nothing. The main goal is to shut up TS about null startPos.
    if (currentSuggestion.startPos === null) {
      return nullResult;
    }

    const lineTextFromSuggestionStartPos = currentLineText.substring(
      currentSuggestion.startPos
    );

    // If the suggestion starts with what the user has typed in, don't reset the suggestion.
    // e.g. the suggestion is "Hello World", and the user has typed in "Hello W" - don't clear suggestion.
    if (currentSuggestion.text?.startsWith(lineTextFromSuggestionStartPos)) {
      return currentSuggestion;
    }

    // If we got this far, return nullResult.
    return nullResult;
  },
});

// Create the decoration that shows the inline suggestion.
// This is called by renderInlineSuggestionPlugin.
export function inlineSuggestionDecoration(
  view: EditorView,
  suggestionText: string,
  suggestionStartPos: number,
  suggestionStartLine: number
) {
  const currentCursorPos = view.state.selection.main.from;
  //const currentCursorPos = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(currentCursorPos);

  // If the cursor is behind the start of the suggestion, clear the suggestion
  // XXX: Is this really necessary?
  // if (currentCursorPos < suggestionStartPos) {
  //   return Decoration.none;
  // }

  const { alreadyTyped, leftToType } = suggestionTextAlreadyTyped(
    suggestionText,
    suggestionStartPos,
    currentLine.text
  );

  if (alreadyTyped === null || leftToType === null) {
    console.log("alreadyTyped and leftToType:", alreadyTyped, leftToType);
    return Decoration.none;
  }

  const inlineSuggestionDecoration = Decoration.widget({
    widget: new InlineSuggestionWidget(leftToType),
    side: 1,
  });

  const adjustedSuggestionStartPos = getAdjustedSuggestionStartPos(
    suggestionStartPos,
    suggestionStartLine,
    alreadyTyped,
    view.state
  );

  /*
  console.log("suggestionText.length", suggestionText);
  console.log("leftToType", leftToType);
  console.log("alreadyTyped", alreadyTyped);
  console.log("adjustedSuggestionStartPos", adjustedSuggestionStartPos);
*/

  const a = Decoration.set([
    inlineSuggestionDecoration.range(adjustedSuggestionStartPos),
  ]);

  return a;
}

export class InlineSuggestionWidget extends WidgetType {
  suggestionText: string;
  constructor(suggestionText: string) {
    super();
    this.suggestionText = suggestionText;
  }
  toDOM() {
    const div = document.createElement("span");
    div.style.opacity = "0.4";
    div.className = "cm-inline-suggestion";
    div.textContent = this.suggestionText;
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

      const suggestionText = update.state.field(InlineSuggestionState)?.text;

      const suggestionStartPosition = update.state.field(
        InlineSuggestionState
      )?.startPos;

      const suggestionStartLine = update.state.field(
        InlineSuggestionState
      )?.startLine;

      if (
        !suggestionText ||
        suggestionStartPosition === null ||
        suggestionStartLine === null
      ) {
        this.decorations = Decoration.none;
        return;
      }

      try {
        this.decorations = inlineSuggestionDecoration(
          update.view,
          suggestionText,
          suggestionStartPosition,
          suggestionStartLine
        );
      } catch (e) {
        console.error("Error calling inlineSuggestionDecoration:", e);
        this.decorations = Decoration.none;
        // clearInlineSuggestion(update.view);
      }
    }
  },
  {
    decorations: (v) => v.decorations,
  }
);

// This is called when the insertion keymap shortcut is called (default is "Tab").
// This is what replaces the suggestion with actual text. So this assumes a suggestion was already fetched.
export function insertInlineSuggestionText(
  editorState: EditorState,
  suggestionText: string,
  suggestionStartPos: number,
  suggestionStartLine: number
): TransactionSpec {
  const currentCursorPos = editorState.selection.main.from;
  const currentLine = editorState.doc.lineAt(currentCursorPos);

  const { alreadyTyped, leftToType } = suggestionTextAlreadyTyped(
    suggestionText,
    suggestionStartPos,
    currentLine.text
  );

  if (alreadyTyped === null || leftToType === null) {
    console.error(
      "insertInlineSuggestionText - alreadyTyped or leftToType is null"
    );
    return {};
  }

  const adjustedSuggestionStartPos = getAdjustedSuggestionStartPos(
    suggestionStartPos,
    suggestionStartLine,
    alreadyTyped,
    editorState
  );

  const transaction = editorState.update({
    changes: { from: adjustedSuggestionStartPos, insert: leftToType },
    // Move the cursor to the end of the inserted suggestion.
    selection: EditorSelection.cursor(
      adjustedSuggestionStartPos + leftToType.length
    ),
    // Adding a lil something the this transaction's userEvent.
    userEvent: "inlineSuggestionAccepted",
  });

  return transaction;
}
