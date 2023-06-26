import { EditorState } from "@codemirror/state";
import { InlineSuggestion } from ".";

/**
 * @param f callback
 * @param wait milliseconds
 * @param promiseRejectValue when the promise is rejected, it will be rejected with this value.
 * @returns Promise
 */
export function debouncePromise<T extends (...args: any[]) => any>(
  fetchSuggestion: T,
  delayBeforeFetching: number,
  promiseRejectValue: any = undefined
) {
  let cancelPreviousFetch: () => void | undefined;

  // type Awaited<T> = T extends PromiseLike<infer U> ? U : T
  type ReturnT = Awaited<ReturnType<T>>;
  const wrapFunc = (...args: Parameters<T>): Promise<ReturnT> => {
    cancelPreviousFetch?.();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => resolve(fetchSuggestion(...args)),
        delayBeforeFetching
      );

      cancelPreviousFetch = () => {
        clearTimeout(timer);

        if (promiseRejectValue !== undefined) {
          reject(promiseRejectValue);
        }
      };
    });
  };

  return wrapFunc;
}

type InlineSuggestionInfo = {
  alreadyTyped: string | null;
  leftToType: string | null;
};

// How much of the suggestion's text overlaps with the current line's text?
// Only compares from the start of the line with start of the suggestion.
// Returns an object with already typed and left to type text.
export const suggestionTextAlreadyTyped = (
  suggestionText: string,
  suggestionStartPos: number,
  currentLineText: string
): InlineSuggestionInfo => {
  const nullResult = { alreadyTyped: null, leftToType: null };

  if (suggestionStartPos > currentLineText.length) {
    // Why is this an error?

    console.error("suggestionStartPos is greater than currentLineText.length");
    return nullResult;
  }

  const lineTextFromSuggestionStartPos =
    currentLineText.substring(suggestionStartPos);

  // If the suggestion text starts with the current line's text, calculate the lengths.
  if (suggestionText.startsWith(lineTextFromSuggestionStartPos)) {
    const alreadyTypedLen = currentLineText.length - suggestionStartPos;

    // If the cursor is past the end of the suggestion, assume there's nothing left to type and return null.
    if (alreadyTypedLen >= suggestionText.length) {
      return nullResult;
    }

    return {
      alreadyTyped: suggestionText.substring(0, alreadyTypedLen),
      leftToType: suggestionText.substring(alreadyTypedLen),
    };
  }

  // lineTextMatchingSuggestion did not start with suggestionText - meaning the suggestion is invalid.
  return nullResult;
};

export const getSuggestionStartPosition = (
  currentLineText: string,
  inlineSuggestion: InlineSuggestion
): number | null => {
  const suggestionText = inlineSuggestion.text;
  const trimmedStartLineTest = currentLineText.trimStart();

  if (!suggestionText) {
    return null;
  }

  if (suggestionText.startsWith(currentLineText)) {
    // If the suggestions and currentLineText start the same, but the suggestion text is larger,
    // assuming the current line already has the suggestion text typed.
    if (trimmedStartLineTest.length >= suggestionText.length) {
      return null;
    }

    // The suggestion text start matches with the current line's text. So startPosition is 0.
    return 0;
  }

  const leadingWhiteSpaceLen =
    currentLineText.length - currentLineText.trimStart().length;

  // Trim the current line's start and do the startsWith check again.
  if (suggestionText.startsWith(currentLineText.trimStart())) {
    // The suggestion text matches with the TRIMMED START of the current line.
    // So the suggestion's start position is the length of the line's text TRIMMED START.

    return leadingWhiteSpaceLen;
  }

  // If the suggestion text and line text don't overlap at the start,
  // we'll set the startPosition at the end of the current line (i.e. currentLineText.length).
  return currentLineText.length;
};

export const getAdjustedSuggestionStartPos = (
  suggestionStartPos: number,
  suggestionStartLine: number,
  alreadyTyped: string,
  editorState: EditorState
): number => {
  const linePosition = editorState.doc.line(suggestionStartLine).from;

  return suggestionStartPos + alreadyTyped.length + linePosition;
};
