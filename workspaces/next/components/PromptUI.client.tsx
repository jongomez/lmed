import { MainStateDispatch } from "@/types/MainTypes";
import {
  PromptTemplateMap,
  getCurrentlySelectedPromptName,
} from "@/utils/promptUtils";
import { Send } from "lucide-react";
import { ChangeEvent } from "react";
import { Button } from "./base/Button.server";

type PromptUIProps = {
  promptTemplateMap: PromptTemplateMap;
  mainStateDispatch: MainStateDispatch;
  className: string;
};

export const PromptUI = ({
  promptTemplateMap,
  mainStateDispatch,
  className,
}: PromptUIProps) => {
  const currentPromptName = getCurrentlySelectedPromptName(promptTemplateMap);
  const handlePromptChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedPromptName = event.target.value;

    mainStateDispatch({
      type: "SET_SELECTED_PROMPT",
      payload: { promptName: selectedPromptName },
    });
  };

  return (
    <div className={`${className} flex justify-center items-center`}>
      <span>Current Prompt:</span>
      <select value={currentPromptName} onChange={handlePromptChange}>
        {[...promptTemplateMap.keys()].map((promptName, index) => (
          <option key={index} value={promptName}>
            {promptName}
          </option>
        ))}
      </select>

      <Button
        onClick={() => {
          // Handle interaction with llms here
        }}
      >
        Send
        <Send size={24} className="inline ml-2" />
      </Button>
    </div>
  );
};
