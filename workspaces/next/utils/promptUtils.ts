import { PromptTab } from "@/types/MainTypes";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";

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
  | "{TextAfterLine}";

type PromptActionToken = "{ReplaceCurrentLine}" | "{ReplaceCurrentSelection}";

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
  prompt: `Your task is to assist in writing code.
Given the context provided, please complete the "Incomplete Line of Code" correctly and coherently.
Consider the context, style, language syntax, and semantics to provide the most suitable code completion. 
If the line of code ends with an opening bracket, remember to provide the corresponding closing bracket.

Code from other files:
${checkedFilesPlaceholder}

Code before line:
${textBeforeLinePlaceholder}

Code after line:
${textAfterLinePlaceholder}

Incomplete Line of Code:
${currentLinePlaceholder}

Please provide the completed line of code:`,
  action: `${replaceCurrentLine}`,
  selected: true,
};

export type PromptTemplateMap = Map<string, PromptTemplate>;

export const defaultPromptTemplateMap = new Map<string, PromptTemplate>([
  ["Line completion", lineCompletionPrompt],
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

const getTextBeforeLine = (fileEditor: ReactCodeMirrorRef): string => {
  if (!fileEditor.view) {
    throw new Error("getTextBeforeLine - fileEditor.view is falsy");
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

const getTextAfterLine = (fileEditor: ReactCodeMirrorRef): string => {
  if (!fileEditor.view) {
    throw new Error("getTextAfterLine - fileEditor.view is falsy");
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

export const applyPromptTemplate = (
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>,
  selectedPrompt: PromptTemplate
): string => {
  // Extract placeholders from the selectedPrompt.
  const { prompt } = selectedPrompt;

  // Get the values for the placeholders from the file editor.
  const textBeforeLine = getTextBeforeLine(fileEditorRef.current);
  const textAfterLine = getTextAfterLine(fileEditorRef.current);
  const currentLine = getCurrentLine(fileEditorRef.current);
  const currentSelection = getCurrentSelection(fileEditorRef.current);
  const checkedFiles = getCheckedFiles();

  // Replace placeholders with the extracted values.
  // WARNING: The replace function only replaces the first occurrence of the placeholder.
  const newPrompt = prompt
    .replace(currentLinePlaceholder, currentLine)
    .replace(currentSelectionPlaceholder, currentSelection)
    .replace(checkedFilesPlaceholder, checkedFiles.join(","))
    .replace(textBeforeLinePlaceholder, textBeforeLine)
    .replace(textAfterLinePlaceholder, textAfterLine);

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
