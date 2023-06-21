import {
  replaceCurrentLineWithCode,
  replaceCurrentSelectionWithCode,
} from "@/utils/editorUtils";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { MutableRefObject } from "react";
import { MenuItem, PopUpMenu } from "./PopUpMenu.server";

type MessageMenuProps = {
  code: string;
  onOverlayClick: () => void;
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
};

export const CodeBlockMenu = ({
  code,
  onOverlayClick,
  fileEditorRef,
}: MessageMenuProps) => {
  return (
    <PopUpMenu
      className="top-[0px] left-[30px] w-[250px] border-2"
      onOverlayClick={onOverlayClick}
    >
      <MenuItem
        onClick={() => {
          replaceCurrentLineWithCode(fileEditorRef.current, code);
          onOverlayClick();
        }}
      >
        Replace current line
      </MenuItem>
      <MenuItem
        onClick={() => {
          replaceCurrentSelectionWithCode(fileEditorRef.current, code);
          onOverlayClick();
        }}
      >
        Replace current selection
      </MenuItem>
    </PopUpMenu>
  );
};
