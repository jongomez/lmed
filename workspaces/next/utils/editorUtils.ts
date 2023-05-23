import type { EditorState, EditorTab, FileNode } from "@/types/MainTypes";
import { Extension } from "@codemirror/state";
import { langs } from "@uiw/codemirror-extensions-langs";
import * as themes from "@uiw/codemirror-themes-all";

/*

Setting up themes and langs example:

https://github.com/uiwjs/react-codemirror/blob/master/www/src/pages/extensions/themes/example.tsx

*/

// TODO: There are many many more languages / themes / keyboardHandlers available.

export const languages = [
  "cpp",
  "css",
  "html",
  "java",
  "javascript",
  "json",
  "lezer",
  "markdown",
  "php",
  "python",
  "rust",
  "sql",
  "xml",
  "wast",
  "ts",
] as const;
export type Language = (typeof languages)[number];

export const themeNamesSingleWord = [
  "abcdef",
  "androidstudio",
  "atomone",
  "aura",
  "bbedit",
  "bespin",
  "darcula",
  "dracula",
  "eclipse",
  "material",
  "nord",
  "okaidia",
  "sublime",
] as const;

export const themeNamesMultipleWords = [
  "duotone-dark",
  "duotone-light",
  "github-dark",
  "github-light",
  "vscode-dark",
  "gruvbox-dark",
  "xcode-dark",
  "xcode-light",
  "solarized-light",
  "solarized-dark",
  "tokyo-night",
  "tokyo-night-day",
  "tokyo-night-storm",
  "noctis-lilac",
] as const;

const allThemeNames = [...themeNamesSingleWord, ...themeNamesMultipleWords];

export type EditorTheme = (typeof allThemeNames)[number];

export const keyboardHandlers = ["emacs", "vim", "vscode", "default"] as const;
export type KeyboardHandler = (typeof keyboardHandlers)[number];

const getLanguageFromFileName = (fileName: string): Language => {
  const extension = fileName.split(".").pop();

  switch (extension) {
    case "js":
      return "javascript";
    case "ts":
      return "ts";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "java":
      return "java";
    case "py":
      return "python";
    case "xml":
      return "xml";
    case "sql":
      return "sql";
    case "cpp":
      return "cpp";
    case "rs":
      return "rust";
    case "php":
      return "php";
    case "wast":
      return "wast";
    default:
      return "markdown";
  }
};

export const getEditorThemeFromState = (
  editorState: EditorState
): Extension => {
  for (const themeNameSingleWord of themeNamesSingleWord) {
    if (themeNameSingleWord === editorState.theme) {
      return themes[themeNameSingleWord];
    }
  }

  // TODO: There are some missing, e.g. gruvbox-light.
  switch (editorState.theme) {
    case "duotone-dark":
      return themes.duotoneDark;
    case "duotone-light":
      return themes.duotoneLight;
    case "gruvbox-dark":
      return themes.gruvboxDark;
    case "solarized-dark":
      return themes.solarizedDark;
    case "solarized-light":
      return themes.solarizedLight;
    case "vscode-dark":
      return themes.vscodeDark;
    case "xcode-dark":
      return themes.xcodeDark;
    case "xcode-light":
      return themes.xcodeLight;
    case "github-dark":
      return themes.githubDark;
    case "github-light":
      return themes.githubLight;
    case "tokyo-night":
      return themes.tokyoNight;
    case "tokyo-night-day":
      return themes.tokyoNightDay;
    case "tokyo-night-storm":
      return themes.tokyoNightStorm;
    case "noctis-lilac":
      return themes.noctisLilac;
    default:
      return themes.githubDark;
  }
};

export const getEditorLanguageFromState = (
  editorState: EditorState
): Extension => {
  // TODO: Check if there are any missing. Very likely there are.
  switch (editorState.currentTab.language) {
    case "javascript":
      return langs.javascript({ jsx: true });
    case "ts":
      return langs.typescript();
    case "html":
      return langs.html();
    case "css":
      return langs.css();
    case "json":
      return langs.json();
    case "markdown":
      return langs.markdown();
    case "java":
      return langs.java();
    case "python":
      return langs.python();
    case "xml":
      return langs.xml();
    case "sql":
      return langs.sql();
    case "cpp":
      return langs.cpp();
    case "rust":
      return langs.rust();
    case "php":
      return langs.php();
    case "wast":
      return langs.wast();
    default:
      return langs.markdown();
  }
};

export const createNewTab = (
  fileNode: FileNode,
  file: File,
  contents: string
): EditorTab => {
  debugger;
  const fileName = file.name;

  return {
    fileNode,
    selected: true,
    value: [contents],
    language: getLanguageFromFileName(fileName),
    hasDiff: false,
    markers: {},
  };
};
