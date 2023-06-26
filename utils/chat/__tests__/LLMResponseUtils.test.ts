import { describe, expect, it } from "@jest/globals";
import { extractCodeBlocksFromMarkdown } from "../LLMResponseUtils"; // replace this with the actual path

describe("extractCodeBlocksFromMarkdown", () => {
  it("should extract single inline code blocks from markdown", () => {
    const markdown = `
# Heading

\`\`\`console.log("hello world");\`\`\`

More text

\`\`\`const a = 3;\`\`\`
`;

    const expectedOutput = ['console.log("hello world");', "const a = 3;"];
    const result = extractCodeBlocksFromMarkdown(markdown);

    expect(result).toEqual(expectedOutput);
  });

  it("should extract multi line code blocks from markdown", () => {
    const markdown = `
# Heading

\`\`\`js
let a = 10;
console.log(a);
\`\`\`

More text

\`\`\`python
def hello_world():
  print('Hello, world!')
\`\`\`
`;

    const expectedOutput = [
      "let a = 10;\nconsole.log(a);",
      "def hello_world():\n  print('Hello, world!')",
    ];
    const result = extractCodeBlocksFromMarkdown(markdown);

    expect(result).toEqual(expectedOutput);
  });

  it("should return empty array if there are no code blocks", () => {
    const markdown = `
# Heading

This is a markdown file with no code blocks
`;

    const expectedOutput: string[] = [];
    const result = extractCodeBlocksFromMarkdown(markdown);

    expect(result).toEqual(expectedOutput);
  });
});
