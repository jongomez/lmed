type ChatSegment = {
  content: string;
  isCodeBlock: boolean;
};

// Function to process a message into chat segments.
// A segment can be either a single line of text, or a code block.
export const preprocessChatMessage = (message: string): ChatSegment[] => {
  const contentLines = message.split(/\n+/);
  const chatSegments: ChatSegment[] = [];
  let isCodeBlock = false;

  for (let line of contentLines) {
    console.log("line", line);

    const trimmedLine = line.trim();
    let finalLineContent = line;

    if (trimmedLine === "```") {
      isCodeBlock = !isCodeBlock;

      // Don't add lines with just ``` characters to the final array.
      continue;
    }

    // Handle inline code blocks, e.g. ```console.log("Hello World!")```
    if (line.startsWith("```") && trimmedLine.length > 3) {
      finalLineContent = line.replace(/```/g, "");

      if (line.endsWith("```")) {
        isCodeBlock = false;
      }
    }

    chatSegments.push({ content: finalLineContent, isCodeBlock });
  }

  return chatSegments;
};
