import { PromptTab } from "@/types/MainTypes";
import { EditorView } from "@codemirror/view";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";

// const INCOMPLETE_LINE_MARKER = "<INCOMPLETE_LINE>";

export type PromptTemplate = {
  prompt: string;
  action: string;
  selected: boolean;
};

type PromptPlaceholder =
  | "{CurrentLine}"
  | "{CurrentSelection}"
  | "{CheckedFiles}"
  | "{TextBeforeLine}"
  | "{TextAfterLine}"
  | "{LineCompletion}";

type PromptActionToken = "{ReplaceCurrentLine}" | "{ReplaceCurrentSelection}";

export const lineCompletionPlaceholder: PromptPlaceholder = "{LineCompletion}";
export const currentLinePlaceholder: PromptPlaceholder = "{CurrentLine}";
export const currentSelectionPlaceholder: PromptPlaceholder =
  "{CurrentSelection}";
export const checkedFilesPlaceholder: PromptPlaceholder = "{CheckedFiles}";
export const textBeforeLinePlaceholder: PromptPlaceholder = "{TextBeforeLine}";
export const textAfterLinePlaceholder: PromptPlaceholder = "{TextAfterLine}";

export const replaceCurrentLine: PromptActionToken = "{ReplaceCurrentLine}";
export const replaceCurrentSelection: PromptActionToken =
  "{ReplaceCurrentSelection}";

const lineCompletionPrompt: PromptTemplate = {
  prompt: `Your task is to assist in writing a single, complete line of code.
Respond using markdown and ensure to enclose your code within triple back ticks \`\`\`.
Your response should contain the whole following line, plus what's missing:
${lineCompletionPlaceholder}
`,
  action: `${replaceCurrentLine}`,
  selected: true, // This is the default prompt - it will be selected by default.
};

const customPrompt: PromptTemplate = {
  prompt: "",
  action: "",
  selected: false,
};

export type PromptTemplateMap = Map<string, PromptTemplate>;

export const defaultPromptTemplateMap = new Map<string, PromptTemplate>([
  ["Line completion", lineCompletionPrompt],
  ["Custom", customPrompt],
]);

export const getCurrentlySelectedPromptName = (
  promptTemplateMap: PromptTemplateMap
): string => {
  let currentlySelectedPromptName: string | undefined;
  let numberOfSelectedPrompts = 0;

  for (const [promptName, prompt] of promptTemplateMap) {
    if (prompt.selected) {
      numberOfSelectedPrompts++;
      currentlySelectedPromptName = promptName;
    }
  }

  if (numberOfSelectedPrompts != 1) {
    throw new Error(
      `Expected 1 file to be selected, but ${numberOfSelectedPrompts} were selected`
    );
  }

  if (!currentlySelectedPromptName) {
    throw new Error("currentlySelectedPromptName is falsy");
  }

  return currentlySelectedPromptName;
};

const getCodeBeforeLine = (fileEditor: ReactCodeMirrorRef): string => {
  if (!fileEditor.view) {
    throw new Error("getCodeBeforeLine - fileEditor.view is falsy");
  }

  const cursorPos = fileEditor.view.state.selection.main.head;
  if (cursorPos !== undefined) {
    const line = fileEditor.view.state.doc.lineAt(cursorPos);
    const from = 0;
    const to = line.from;
    return fileEditor.view.state.doc.sliceString(from, to);
  }

  return "";
};

const getCodeAfterLine = (fileEditor: ReactCodeMirrorRef): string => {
  if (!fileEditor.view) {
    throw new Error("getCodeAfterLine - fileEditor.view is falsy");
  }

  const cursorPos = fileEditor.view.state.selection.main.head;
  if (cursorPos !== undefined) {
    const line = fileEditor.view.state.doc.lineAt(cursorPos);
    const from = line.to;
    const to = fileEditor.view.state.doc.length;
    return fileEditor.view.state.doc.sliceString(from, to);
  }

  return "";
};

const getCurrentLine = (fileEditor: ReactCodeMirrorRef): string => {
  if (!fileEditor.view) {
    throw new Error("getCurrentLine - fileEditor.view is falsy");
  }

  const cursorPos = fileEditor.view.state.selection.main.head;
  if (cursorPos !== undefined) {
    const line = fileEditor.view.state.doc.lineAt(cursorPos);
    return line.text;
  }
  return "";
};

const getCurrentSelection = (fileEditor: ReactCodeMirrorRef): string => {
  if (!fileEditor.view) {
    throw new Error("getCurrentSelection - fileEditor.view is falsy");
  }

  const { from, to } = fileEditor.view.state.selection.main;
  return fileEditor.view?.state.doc.sliceString(from, to) || "";
};

const getCheckedFiles = (): string[] => {
  // TODO: Implement this.
  return [];
};

export const getCurrentlySelectedPrompt = (
  promptTemplateMap: PromptTemplateMap
): PromptTemplate => {
  const currentlySelectedPromptName =
    getCurrentlySelectedPromptName(promptTemplateMap);
  const currentlySelectedPrompt = promptTemplateMap.get(
    currentlySelectedPromptName
  );

  if (!currentlySelectedPrompt) {
    throw new Error("currentlySelectedPrompt is falsy");
  }

  return currentlySelectedPrompt;
};

const getPreviousLine = (view: EditorView): string => {
  const cursorPos = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPos);
  const prevLine =
    currentLine.number > 1
      ? view.state.doc.line(currentLine.number - 1).text
      : null;

  return prevLine || "N/A";
};

const getNextLine = (view: EditorView): string => {
  const cursorPos = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPos);
  const nextLine =
    currentLine.number < view.state.doc.lines
      ? view.state.doc.line(currentLine.number + 1).text
      : null;

  return nextLine || "N/A";
};

export const getCodeForLineCompletionPrompt = (
  fileEditor: ReactCodeMirrorRef
): string => {
  let finalPrompt = "";

  if (!fileEditor.view) {
    throw new Error(
      "getCodeForLineCompletionPrompt - fileEditor.view is falsy"
    );
  }

  const cursorPos = fileEditor.view.state.selection.main.head;

  if (cursorPos === undefined) {
    throw new Error("Cursor position could not be determined");
  }

  const codeBeforeCursor = getCodeBeforeLine(fileEditor);
  const codeAfterCursor = getCodeAfterLine(fileEditor);

  if (codeBeforeCursor.trim()) {
    finalPrompt += `Code before:\n${codeBeforeCursor}\n`;
  }

  if (codeAfterCursor.trim()) {
    finalPrompt += `Code after:\n${codeBeforeCursor}\n`;
  }

  const currentLine = fileEditor.view.state.doc.lineAt(cursorPos);

  if (currentLine.text.trim()) {
    // If we have something to show for the current line - ask the LLM to complete it.
    finalPrompt += `Generate a complete line of code that can replace the following line:\n${currentLine.text}`;
  } else {
    // If we don't have anything to show for the current line - ask the LLM to create something.
    finalPrompt += "Given the context, create a new line of code.";
  }

  return finalPrompt;
};

export const placeholders: Record<PromptPlaceholder, PlaceholderFunction> = {
  [lineCompletionPlaceholder]: getCodeForLineCompletionPrompt,
  [currentLinePlaceholder]: getCurrentLine,
  [currentSelectionPlaceholder]: getCurrentSelection,
  [checkedFilesPlaceholder]: () => getCheckedFiles().join(","),
  [textBeforeLinePlaceholder]: getCodeBeforeLine,
  [textAfterLinePlaceholder]: getCodeAfterLine,
};

export const applyPromptTemplate = (
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>,
  promptTemplate: PromptTemplate
): string => {
  let newPrompt = promptTemplate.prompt;

  // Replace each placeholder with the result of its corresponding function
  for (const [placeholder, func] of Object.entries(placeholders)) {
    newPrompt = newPrompt.replace(placeholder, func(fileEditorRef.current));
  }

  return newPrompt;
};

export const getCurrentlySelectedPromptTab = (
  allTabs: PromptTab[]
): PromptTab => {
  for (const tab of allTabs) {
    if (tab.selected) {
      return tab;
    }
  }

  throw new Error("No prompt tab is selected");
};

type PlaceholderFunction = (fileEditor: ReactCodeMirrorRef) => string;
