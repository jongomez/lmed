import { LLMMessageHeaderProps } from "../chat/MessageHeaders.client";
import { MenuItem, PopUpMenu } from "./PopUpMenu.server";

type LLMMessageMenuProps = {
  setMessageMode: LLMMessageHeaderProps["setMessageMode"];
  onOverlayClick: () => void;
};

export const LLMMessageMenu = ({
  setMessageMode,
  onOverlayClick,
}: LLMMessageMenuProps) => {
  return (
    <PopUpMenu
      className="top-[0px] right-[30px] w-[120px]"
      onOverlayClick={onOverlayClick}
    >
      <MenuItem
        onClick={() => {
          setMessageMode("markdown");
          onOverlayClick();
        }}
      >
        Markdown
      </MenuItem>
      <MenuItem
        onClick={() => {
          setMessageMode("raw");
          onOverlayClick();
        }}
      >
        Raw
      </MenuItem>
    </PopUpMenu>
  );
};
