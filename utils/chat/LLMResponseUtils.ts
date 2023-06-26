import { toString } from "mdast-util-to-string";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export const extractCodeBlocksFromMarkdown = (markdown: string): string[] => {
  let codeBlocks: string[] = [];

  const tree = unified().use(remarkParse).parse(markdown);

  visit(tree, ["code", "inlineCode"], (node) => {
    codeBlocks.push(toString(node));
  });

  return codeBlocks;
};

/*
// I wish it were this simple :(
export const extractCodeFromLLMResponse = (llmResponse: string): string => {
  const code = llmResponse.match(/```(.*?)```/);

  if (!code || !code[1]) {
    return "";
  }

  return code[1];
};
*/
