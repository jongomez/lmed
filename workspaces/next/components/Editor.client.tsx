"use client";

import { ChangeEvent } from "react";
import { diff as DiffEditor, IDiffEditorProps } from "react-ace";

import { EditorState, SetMainState } from "@/types/Main";
import { Box } from "@mui/material";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-noconflict/theme-github";

const defaultValue = [
  `// Use this tool to display differences in code.
// Deletions will be highlighted on the left, insertions highlighted on the right.`,
  `// Use this too to show difference in code.
// Deletions will be highlighted on the left, insertions highlighted on the right.
// The diff highlighting style can be altered in CSS.
`,
];

const languages = [
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
];

languages.forEach((lang) => {
  require(`ace-builds/src-noconflict/mode-${lang}`);
  require(`ace-builds/src-noconflict/snippets/${lang}`);
});

type EditorProps = {
  editorState: EditorState;
  setMainState: SetMainState;
};

export const Editor = ({ editorState, setMainState }: EditorProps) => {
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
      <h2>Editor</h2>
      <p>Language detected: {editorState.currentTab.mode}</p>

      <DiffEditor
        ref={editorState.diffEditorRef}
        onChange={onChange}
        {...editorProps}
      />

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
