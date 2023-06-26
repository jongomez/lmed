type MenuOverlayProps = {
  className?: string;
  onClick: () => void;
};

export const MenuOverlay = ({ onClick, className }: MenuOverlayProps) => {
  return (
    <div
      onClick={onClick}
      // className="fixed top-[42px] left-0 w-full h-[calc(100vh_-_42px)] z-10 bg-black bg-opacity-50"
      // className="fixed top-0 left-0 w-full h-full z-10 bg-black bg-opacity-50"
      className="fixed top-0 left-0 w-full h-full z-40"
    ></div>
  );
};
