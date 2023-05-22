import type { EditorState } from "@/types/Main";
import { P } from "./base/Typography.server";

type MainFooterProps = {
  editorState: EditorState;
  activeIndex: number;
};

export const MainFooter = ({ editorState, activeIndex }: MainFooterProps) => {
  return (
    <div className="flex-grow-0 flex-shrink-0 h-20px flex justify-center">
      {activeIndex === 0 && (
        <P>Editor mode: {editorState.currentTab.language}</P>
      )}
    </div>
  );
};
