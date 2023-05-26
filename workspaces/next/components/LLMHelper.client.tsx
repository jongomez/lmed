import { EditorState, MainStateDispatch } from "@/types/MainTypes";
import { Button } from "./base/Button.server";

type PromptType = {
  name: string;
  content: string;
};

const prompts = [
  {
    name: "Code Completion",
    content:
      "Given the following code snippet, predict the next line(s) of code:",
  },
];

type LLMHelperProps = {
  editorState: EditorState;
  mainStateDispatch: MainStateDispatch;
  className: string;
};

export const LLMHelper = ({
  editorState,
  mainStateDispatch,
  className,
}: LLMHelperProps) => {
  return (
    <div className={`text-center ${className}`}>
      <Button>Run</Button>
      <Button>Preview</Button>
      <Button>Source Code</Button>
    </div>
  );
};
