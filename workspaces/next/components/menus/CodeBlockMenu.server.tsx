import { MainStateDispatch } from "@/types/MainTypes";
import { MenuItem, PopUpMenu } from "./PopUpMenu.server";

type MessageMenuProps = {
  mainStateDispatch: MainStateDispatch;
};

export const MessageMenu = ({ mainStateDispatch }: MessageMenuProps) => {
  return (
    <PopUpMenu
      className="top-[42px] w-[200px]"
      onOverlayClick={() => mainStateDispatch({ type: "TOGGLE_MAIN_MENU" })}
    >
      <MenuItem onClick={() => {}}>Copy</MenuItem>
      <MenuItem onClick={() => {}}>Replace current line</MenuItem>
    </PopUpMenu>
  );
};
