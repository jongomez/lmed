"use client";

import { ChangeEvent, useEffect } from "react";
import type { IDiffEditorProps, ace, diff } from "react-ace";

import { EditorState, SetMainState } from "@/types/Main";
import { Box } from "@mui/material";

import { mapThemeToImport } from "@/utils/editorUtils";

const oldDefaultValue = [
  `// Use this tool to display differences in code.
// Deletions will be highlighted on the left, insertions highlighted on the right.`,
  `// Use this too to show difference in code.
// Deletions will be highlighted on the left, insertions highlighted on the right.
// The diff highlighting style can be altered in CSS.
`,
];

// TODO: There are many many more languages / themes / keyboardHandlers available.

export const languages = [
  "javascript",
  "java",
  "python",
  "xml",
  "ruby",
  "sass",
  "markdown",
  "mysql",
  "json",
  "html",
  "handlebars",
  "golang",
  "csharp",
  "elixir",
  "typescript",
  "css",
] as const;
export type Language = (typeof languages)[number];

export const themes = [
  "monokai",
  "github",
  "tomorrow",
  "kuroir",
  "twilight",
  "xcode",
  "textmate",
  "solarized dark",
  "solarized light",
  "terminal",
] as const;
export type EditorTheme = (typeof themes)[number];

export const keyboardHandlers = ["emacs", "vim", "vscode", "default"] as const;
export type KeyboardHandler = (typeof keyboardHandlers)[number];

type EditorProps = {
  editorState: EditorState;
  setMainState: SetMainState;
};

export const Editor = ({ editorState, setMainState }: EditorProps) => {
  // Disgusting hack.
  let AceEditor: ace | null = null;
  let DiffEditor: diff | null = null;

  // https://github.com/securingsincity/react-ace/issues/27
  // https://github.com/JedWatson/react-codemirror/issues/77
  useEffect(() => {
    DiffEditor = require("react-ace";
    import "ace-builds/src-min-noconflict/ext-language_tools";
    import "ace-builds/src-min-noconflict/ext-searchbox";
    import "ace-builds/src-noconflict/mode-jsx";
    import "ace-builds/src-noconflict/theme-github";

    languages.forEach((lang) => {
      require(`ace-builds/src-noconflict/mode-${lang}`);
      require(`ace-builds/src-noconflict/snippets/${lang}`);
    });

    themes.forEach((theme) =>
      require(`ace-builds/src-noconflict/theme-${mapThemeToImport(theme)}`)
    );
  }, []);

  const onChange = (newValue: string[]) => {
    setMainState((prevState) => ({ ...prevState, value: newValue }));
  };

  const handleModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMainState((prevState) => ({ ...prevState, mode: e.target.value }));
  };

  const editorProps: IDiffEditorProps = {
    height: "1000px",
    width: "1000px",
    setOptions: {
      useWorker: false,
    },
    mode: editorState.currentTab.mode,
    value: editorState.currentTab.value,
  };

  return (
    <Box>
      <p>Editor mode: {editorState.currentTab.mode}</p>

      {DiffEditor && (
        <DiffEditor
          ref={editorState.diffEditorRef}
          onChange={onChange}
          {...editorProps}
        />
      )}

      {/*         
      {editorState.currentTab.hasDiff ? (
        <DiffEditor
          ref={editorState.diffEditorRef}
          onChange={onChange}
          value={editorState.currentTab.value}
          {...editorProps}
        />
      ) : (
        <AceEditor
          ref={editorState.diffEditorRef}
          onChange={onChange}
          {...editorProps}
        />
      )} */}
    </Box>
  );
};
