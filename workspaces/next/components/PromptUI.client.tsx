import { MainStateDispatch } from "@/types/MainTypes";
import {
  PromptTemplateMap,
  getCurrentlySelectedPromptName,
} from "@/utils/promptUtils";
import { ChangeEvent } from "react";

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
    <div
      className={`${className} flex justify-center items-center main-text-colors flex-wrap m-1 p-1`}
    >
      <span className="m-1">Prompt:</span>
      <select
        value={currentPromptName}
        onChange={handlePromptChange}
        className="rounded-lg p-2 bg-secondary-colors focus-ring"
      >
        {[...promptTemplateMap.keys()].map((promptName, index) => (
          <option key={index} value={promptName}>
            {promptName}
          </option>
        ))}
      </select>
    </div>
  );
};
