import { MainState, MainStateDispatch } from "@/types/MainTypes";
import { Delta } from "@/utils/hooks";
import { Explorer } from "./Explorer.client";
import { FileEditor } from "./FileEditor.client";
import { PromptEditor } from "./PromptEditor.client";
import { ResizeHandle } from "./ResizeHandle.client";
import { PromptTabs } from "./Tabs.server";

type FileAndPromptEditorsProps = {
  mainState: MainState;
  mainStateDispatch: MainStateDispatch;
  activeTab: number;
};

export const FileAndPromptEditors = ({
  mainState,
  mainStateDispatch,
  activeTab,
}: FileAndPromptEditorsProps) => {
  const isVisible = activeTab === 0;
  // 1st row: file explorer and file editor.
  // 2nd row: handle element to resize the editors.
  // 3rd row: prompt header.
  // 4th row: prompt explorer and prompt editor.
  // There will also be a resize handle column to resize the explorers vertically.
  const adjustableRowSize = mainState.layout.adjustableRowSize;

  return (
    <div
      // Use style={{}} for the grid layout values - because tailwind is not great with dynamic values.
      // (the grid is dynamic because users can resize it)
      style={{
        gridTemplateRows: "1fr 4px 42px " + adjustableRowSize + "px",
        gridTemplateColumns: "minmax(150px, 250px) 1fr",
      }}
      className={`${isVisible ? "grid" : "hidden"} h-[calc(100vh_-_42px)]`}
    >
      <Explorer
        explorerState={mainState.explorer}
        fileEditorState={mainState.fileEditor}
        mainStateDispatch={mainStateDispatch}
        parentNode={mainState.explorer.explorerTreeRoot}
        className="row-start-1"
      />

      <FileEditor
        fileEditorState={mainState.fileEditor}
        globalEditorSettings={mainState.globalEditorSettings}
        mainStateDispatch={mainStateDispatch}
        explorerState={mainState.explorer}
        className="row-start-1"
      />

      <ResizeHandle
        className="row-start-2 col-span-full"
        cursor="cursor-row-resize"
        initialSize={adjustableRowSize}
        onDrag={(delta: Delta, initialSize: number, event: PointerEvent) => {
          // console.log("delta", delta);
          // console.log("initialSize", initialSize);

          mainStateDispatch({
            type: "RESIZE_EXPLORER_HORIZONTALLY",
            payload: { delta, event, initialRowSize: initialSize },
          });
        }}
      />

      <PromptTabs
        promptEditorState={mainState.promptEditor}
        mainStateDispatch={mainStateDispatch}
        className="row-start-4 flex flex-col overflow-auto"
      />

      <PromptEditor
        fileEditorState={mainState.fileEditor}
        globalEditorSettings={mainState.globalEditorSettings}
        mainStateDispatch={mainStateDispatch}
        explorerState={mainState.explorer}
        className="row-start-4"
      />
    </div>
  );
};
