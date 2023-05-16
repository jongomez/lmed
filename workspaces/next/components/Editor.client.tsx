import React, { ChangeEvent, useState } from "react";
import { diff as DiffEditor } from "react-ace";

import "ace-builds/src-noconflict/mode-jsx";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";
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

type EditorState = {
  value: string[];
  fontSize: number;
  markers: object;
  mode: string;
};

export const Editor = () => {
  const [state, setState] = useState<EditorState>({
    value: defaultValue,
    fontSize: 14,
    markers: {},
    mode: "javascript",
  });

  const onChange = (newValue: string[]) => {
    setState((prevState) => ({ ...prevState, value: newValue }));
  };

  const handleModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setState((prevState) => ({ ...prevState, mode: e.target.value }));
  };

  return (
    <div className="columns">
      <div className="column">
        <div className="field">
          <label>Mode:</label>
          <p className="control">
            <span className="select">
              <select
                name="mode"
                onChange={handleModeChange}
                value={state.mode}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </span>
          </p>
        </div>

        <div className="field" />
      </div>
      <div className="examples column">
        <h2>Editor</h2>
        <DiffEditor
          value={state.value}
          height="1000px"
          width="1000px"
          setOptions={{
            useWorker: false,
          }}
          mode={state.mode}
          onChange={onChange}
        />
      </div>
    </div>
  );
};
