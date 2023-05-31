import type { FileEditorState } from "@/types/MainTypes";
import { getSelectedTab } from "@/utils/tabUtils";

type MainFooterProps = {
  fileEditorState: FileEditorState;
  activeIndex: number;
};

export const MainFooter = ({
  fileEditorState,
  activeIndex,
}: MainFooterProps) => {
  if (activeIndex !== 0) {
    return null;
  }

  return (
    <div className="col-span-full row-start-5 flex justify-center main-text-colors">
      File editor mode: {getSelectedTab(fileEditorState.allTabs).language}
    </div>
  );
};
