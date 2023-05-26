import type { EditorState } from "@/types/MainTypes";

type MainFooterProps = {
  editorState: EditorState;
  activeIndex: number;
};

export const MainFooter = ({ editorState, activeIndex }: MainFooterProps) => {
  if (activeIndex !== 0) {
    return null;
  }

  return (
    <div className="col-span-full row-start-4 flex justify-center main-text-colors">
      Editor mode: {editorState.currentTab.language}
    </div>
  );
};
