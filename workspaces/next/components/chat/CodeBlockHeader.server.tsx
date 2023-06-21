import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { ClipboardCheck, ClipboardCopy, MoreHorizontal } from "lucide-react";
import { MutableRefObject, useEffect, useState } from "react";
import { CodeBlockMenu } from "../menus/CodeBlockMenu.server";

type CodeBlockHeaderProps = {
  fileEditorRef: MutableRefObject<ReactCodeMirrorRef>;
  code: string;
};

export const CodeBlockHeader = ({
  fileEditorRef,
  code,
}: CodeBlockHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showingCopiedMessage, setShowingCopiedMessage] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (showingCopiedMessage) {
      const timeout = setTimeout(() => {
        setShowingCopiedMessage(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [showingCopiedMessage]);

  return (
    <div
      className="bg-slate-600 main-text-white
      flex justify-between items-center px-2 py-1 text-sm
      mt-4
      rounded-t-[0.3em]"
    >
      <div className="relative">
        <MoreHorizontal
          size={24}
          className="mx-1 cursor-pointer main-text-white hover:text-slate-50"
          onClick={toggleMenu}
        />

        {isMenuOpen && (
          <CodeBlockMenu
            code={code}
            onOverlayClick={toggleMenu}
            fileEditorRef={fileEditorRef}
          />
        )}
      </div>

      <div
        className="flex items-center cursor-pointer hover:text-slate-50"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setShowingCopiedMessage(true);
        }}
      >
        {showingCopiedMessage ? (
          <>
            <div className="mr-1">Copied</div>
            <ClipboardCheck size={18} />
          </>
        ) : (
          <>
            <div className="mr-1">Copy</div>
            <ClipboardCopy size={18} />
          </>
        )}
      </div>
    </div>
  );
};
