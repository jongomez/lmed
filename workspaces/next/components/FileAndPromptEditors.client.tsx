import { MainState, MainStateDispatch } from "@/types/MainTypes";
import { RESIZE_HANDLE_SIZE_PX } from "@/utils/constants";
import { Delta } from "@/utils/hooks";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { Explorer } from "./Explorer.client";
import { FileEditor } from "./FileEditor.client";
import { PromptEditor } from "./PromptEditor.client";
import { ResizeHandle } from "./ResizeHandle.client";
import { PromptTabs } from "./Tabs.server";

type FileAndPromptEditorsProps = {
  mainState: MainState;
  mainStateDispatch: MainStateDispatch;
  activeTab: number;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const FileAndPromptEditors = ({
  mainState,
  mainStateDispatch,
  activeTab,
  fileEditorRef,
}: FileAndPromptEditorsProps) => {
  const isVisible = activeTab === 0;
  // 1st row: file explorer and file editor.
  // 2nd row: handle element to resize the editors.
  // 3rd row: prompt header.
  // 4th row: prompt explorer and prompt editor.
  // There will also be a resize handle column to resize the explorers vertically.
  const resizableRowSize = mainState.layout.resizableRowSize;
  const resizableColSize = mainState.layout.resizableColSize;

  return (
    <div
      // Use style={{}} for the grid layout values - because tailwind is not great with dynamic values.
      // (the grid is dynamic because users can resize it)
      style={{
        gridTemplateRows:
          "1fr " +
          RESIZE_HANDLE_SIZE_PX +
          "px " +
          "42px " +
          resizableRowSize +
          "px",
        gridTemplateColumns:
          resizableColSize + "px " + RESIZE_HANDLE_SIZE_PX + "px 1fr",
      }}
      className={`${isVisible ? "grid" : "hidden"} h-[calc(100vh_-_42px)]`}
    >
      <Explorer
        explorerNodeMap={mainState.explorerNodeMap}
        fileEditorRef={fileEditorRef}
        mainStateDispatch={mainStateDispatch}
        className="row-start-1"
      />

      <ResizeHandle
        className="row-start-1 row-span-full col-start-2"
        cursor="cursor-col-resize"
        invisiblePaddingPosition="left"
        initialSize={resizableColSize}
        onDrag={(delta: Delta, initialSize: number, event: PointerEvent) => {
          // console.log("delta", delta);
          // console.log("initialSize", initialSize);

          mainStateDispatch({
            type: "RESIZE_EDITORS_VERTICALLY",
            payload: { delta, event, initialColSize: initialSize },
          });
        }}
      />

      <FileEditor
        fileEditorRef={fileEditorRef}
        globalEditorSettings={mainState.globalEditorSettings}
        mainStateDispatch={mainStateDispatch}
        explorerNodeMap={mainState.explorerNodeMap}
        className="row-start-1 col-start-3"
      />

      <ResizeHandle
        className="row-start-2 col-span-full"
        cursor="cursor-row-resize"
        invisiblePaddingPosition="bottom"
        initialSize={resizableRowSize}
        onDrag={(delta: Delta, initialSize: number, event: PointerEvent) => {
          // console.log("delta", delta);
          // console.log("initialSize", initialSize);

          mainStateDispatch({
            type: "RESIZE_EDITORS_HORIZONTALLY",
            payload: { delta, event, initialRowSize: initialSize },
          });
        }}
      />

      <PromptTabs
        promptEditorState={mainState.promptEditor}
        mainStateDispatch={mainStateDispatch}
        className="row-start-4 col-start-1 flex flex-col overflow-auto"
      />

      <PromptEditor
        fileEditorState={mainState.fileEditor}
        globalEditorSettings={mainState.globalEditorSettings}
        mainStateDispatch={mainStateDispatch}
        explorerNodeMap={mainState.explorerNodeMap}
        className="row-start-4 col-start-3"
      />
    </div>
  );
};
