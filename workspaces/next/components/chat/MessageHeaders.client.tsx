import { MoreHorizontal } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { LLMMessageMenu } from "../menus/LLMMessageMenu.server";

const headerClasses = "font-semibold main-text-colors py-2 px-2.5";

export const UserMessageHeader = () => {
  return <div className={headerClasses}>User:</div>;
};

export type LLMMessageHeaderProps = {
  setMessageMode: Dispatch<SetStateAction<"markdown" | "raw">>;
};

export const LLMMessageHeader = ({ setMessageMode }: LLMMessageHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="flex justify-between items-center">
      <div className={headerClasses}>LLM:</div>
      <div className="relative">
        <MoreHorizontal
          size={24}
          className="mx-1 cursor-pointer main-text-colors hover-main-text-colors"
          onClick={toggleMenu}
        />

        {isMenuOpen && (
          <LLMMessageMenu
            onOverlayClick={toggleMenu}
            setMessageMode={setMessageMode}
          />
        )}
      </div>
    </div>
  );
};
