export const extractCodeFromLLMResponse = (llmResponse: string): string => {
  const code = llmResponse.match(/```(.*?)```/);

  if (!code || !code[1]) {
    return "";
  }

  return code[1];
};
