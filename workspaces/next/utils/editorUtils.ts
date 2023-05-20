import { EditorTheme, Language } from "@/components/Editor.client";
import type { EditorTab, FileNode } from "@/types/Main";

const getModeFromFileName = (fileName: string): Language => {
  const extension = fileName.split(".").pop();
  switch (extension) {
    case "js":
      return "javascript";
    case "ts":
      return "typescript";
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
    case "rb":
      return "ruby";
    case "scss":
      return "sass";
    case "sql":
      return "mysql";
    case "hbs":
      return "handlebars";
    case "go":
      return "golang";
    case "cs":
      return "csharp";
    case "ex":
    case "exs":
      return "elixir";
    default:
      return "markdown";
  }
};

export const mapThemeToImport = (theme: EditorTheme) => {
  switch (theme) {
    case "solarized dark":
      return "solarized_dark";
    case "solarized light":
      return "solarized_light";
    default:
      return theme;
  }
};

export const createNewTab = (
  fileNode: FileNode,
  file: File,
  contents: string
): EditorTab => {
  const fileName = file.name;

  return {
    fileNode,
    selected: true,
    name: fileName,
    value: [contents],
    mode: getModeFromFileName(fileName),
    hasDiff: false,
    markers: {},
  };
};
