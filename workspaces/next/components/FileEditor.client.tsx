"use client";

import CodeMirror from "@uiw/react-codemirror";
import { MutableRefObject, useCallback, useRef } from "react";

import {
  FileNode,
  GlobalEditorSettings,
  MainState,
  MainStateDispatch,
} from "@/types/MainTypes";
import {
  getEditorLanguageFromState,
  getEditorThemeFromState,
} from "@/utils/editorUtils";
import {
  SwitchToNewFileAnnotation,
  getCurrentlySelectedFilePath,
} from "@/utils/fileUtils";
import { ViewUpdate } from "@codemirror/view";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

type FileEditorProps = {
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  globalEditorSettings: GlobalEditorSettings;
  mainStateDispatch: MainStateDispatch;
  explorerNodeMap: MainState["explorerNodeMap"];
  className: string;
};

export const FileEditor = ({
  fileEditorRef,
  globalEditorSettings,
  mainStateDispatch,
  explorerNodeMap,
  className,
}: FileEditorProps) => {
  const selectedFilePath = useRef<string>(
    getCurrentlySelectedFilePath(explorerNodeMap)
  );

  // Gotta use a ref callback:
  // https://github.com/uiwjs/react-codemirror/issues/314
  function refCallack(editor: ReactCodeMirrorRef) {
    if (
      !fileEditorRef.current?.editor &&
      editor?.editor &&
      editor?.state &&
      editor?.view
    ) {
      console.log("\n\neditor:", editor);
      // WARNING: This is a mutation. Refs are mutable.
      fileEditorRef.current = editor;
    }
  }

  // TODO: serialize editor state and store it in localStorage?
  //  https://github.com/uiwjs/react-codemirror#use-initialstate-to-restore-state-from-json-serialized-representation
  const onChange = useCallback(
    (value: string, viewUpdate: ViewUpdate) => {
      const annotation = viewUpdate.transactions[0]?.annotation(
        SwitchToNewFileAnnotation
      );

      console.log("value:", value);
      console.log("annotation:", annotation);

      if (annotation === "FIRST_TIME_OPENING_FILE") {
        return;
      }

      let selectedFile = explorerNodeMap.get(
        selectedFilePath.current
      ) as FileNode;
      if (!selectedFile.selected) {
        // The selectedFilePath ref is NOT up to date. Let's update it.
        selectedFilePath.current =
          getCurrentlySelectedFilePath(explorerNodeMap);
        selectedFile = explorerNodeMap.get(
          selectedFilePath.current
        ) as FileNode;
      }

      if (!selectedFile.isDirty) {
        // Set the file as dirty.
        mainStateDispatch({
          type: "UPDATE_FILE_IS_DIRTY",
          payload: { fileNode: selectedFile, isDirty: true },
        });
      }
    },
    [selectedFilePath, explorerNodeMap, mainStateDispatch]
  );

  return (
    <div className={`${className} overflow-auto`}>
      <CodeMirror
        ref={refCallack}
        value="console.log('hello world!');"
        theme={getEditorThemeFromState(globalEditorSettings)}
        extensions={[getEditorLanguageFromState(explorerNodeMap)]}
        onChange={onChange}
        // Both style={{ height: "100%" }} and height="100%" are necessary.
        style={{ height: "100%" }}
        height="100%"
        width="100%"
      />
    </div>
  );
};
