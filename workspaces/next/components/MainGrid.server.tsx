import { MainState, MainStateDispatch } from "@/types/MainTypes";
import { Delta } from "@/utils/hooks/useDrag";
import { getMainGridStyles } from "@/utils/layoutUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { Chat } from "./Chat.client";
import { Explorer } from "./Explorer.client";
import { FileEditor } from "./FileEditor.client";
import { ResizeHandle } from "./ResizeHandle.client";
import { MyTerminal } from "./Terminal.client";

type MainGridProps = {
  mainState: MainState;
  mainStateDispatch: MainStateDispatch;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  activeHeaderItems: MainState["activeHeaderItems"];
};

export const MainGrid = ({
  mainState,
  mainStateDispatch,
  fileEditorRef,
  activeHeaderItems,
}: MainGridProps) => {
  const {
    mainGridStyle,
    explorerClassNames,
    resizeHandleClassNames,
    fileEditorClassNames,
    terminalClassNames,
    chatClassNames,
    resizeHandleInitialSize,
  } = getMainGridStyles(mainState.layout);

  return (
    <div style={mainGridStyle} className="bg-main-colors">
      <Chat
        mainStateDispatch={mainStateDispatch}
        promptSuggestion={mainState.promptSuggestion}
        promptTemplateMap={mainState.promptTemplateMap}
        className={chatClassNames}
        isChatActive={mainState.activeHeaderItems.chat}
        settings={mainState.settings}
        chatState={mainState.chatState}
        fileEditorRef={fileEditorRef}
      />

      <Explorer
        explorerNodeMap={mainState.explorerNodeMap}
        fileEditorRef={fileEditorRef}
        mainStateDispatch={mainStateDispatch}
        className={explorerClassNames}
        isExplorerActive={mainState.activeHeaderItems.explorer}
      />

      <ResizeHandle
        className={resizeHandleClassNames}
        cursor="cursor-col-resize"
        invisiblePaddingPosition="left"
        initialSize={resizeHandleInitialSize}
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
        settings={mainState.settings}
        mainStateDispatch={mainStateDispatch}
        explorerNodeMap={mainState.explorerNodeMap}
        promptTemplateMap={mainState.promptTemplateMap}
        className={fileEditorClassNames}
        isFileEditorActive={mainState.activeHeaderItems.fileEditor}
        lastLLMResponse={mainState.lastLLMResponse}
        chatState={mainState.chatState}
      />

      <MyTerminal
        isTerminalActive={mainState.activeHeaderItems.terminal}
        className={terminalClassNames}
        layoutState={mainState.layout}
      />
    </div>
  );
};
