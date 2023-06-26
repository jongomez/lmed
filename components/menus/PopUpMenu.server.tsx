import { ReactNode } from "react";
import { MenuOverlay } from "./MenuOverlay.server";

type MenuItemProps = {
  onClick: () => void;
  children: ReactNode;
  className?: string;
};

export const MenuItem = ({ onClick, children, className }: MenuItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-2 cursor-pointer main-text-colors hover-main-text-colors
        hover-secondary-colors rounded-md
        ${className || ""}
      `}
    >
      {children}
    </div>
  );
};

type PopUpMenuProps = {
  onOverlayClick: () => void;
  children: ReactNode;
  className?: string;
};

export const PopUpMenu = ({
  className,
  onOverlayClick,
  children,
}: PopUpMenuProps) => {
  return (
    <>
      <MenuOverlay onClick={onOverlayClick} />
      <div
        className={`absolute p-3
          border-r-2 border-b-2 border-innactive-colors 
          z-50 bg-white dark:bg-slate-800 ${className}`}
      >
        {children}
      </div>
    </>
  );
};
