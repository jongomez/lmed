import type { EditorState } from "@/types/MainTypes";
import { P } from "./base/Typography.server";

type MainFooterProps = {
  editorState: EditorState;
  activeIndex: number;
};

export const MainFooter = ({ editorState, activeIndex }: MainFooterProps) => {
  return (
    <div className="col-span-full row-start-3 flex justify-center">
      {activeIndex === 0 && (
        <P className="mt-0">Editor mode: {editorState.currentTab.language}</P>
      )}
    </div>
  );
};
