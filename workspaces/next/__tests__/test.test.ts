import { describe, expect, it } from "@jest/globals";

describe.skip("test", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});

/*

import { ReactCodeMirrorRef } from "@uiw/react-codemirror";
import { ClipboardCopy } from "lucide-react";
import { MutableRefObject, useState } from "react";
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
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const iconSize = 24;

  return (
    <div
      className="bg-slate-600 main-text-white
      flex justify-between items-center px-2 py-2 text-sm
      rounded-t-[0.3em]"
    >
      <div className="relative">
        <MoreHorizontal
          size={iconSize}
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
        className="flex align-middle cursor-pointer hover:text-slate-50"
        onClick={() => {


          XXX: 
          
          
        }}
      >
        <div className="mr-1">Copy</div>
        <ClipboardCopy size={iconSize} />
      </div>
    </div>
  );
};


*/
