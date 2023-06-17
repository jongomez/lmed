import { describe, expect, it } from "@jest/globals";
import { preprocessChatMessage } from "../preprocessChatMessage";

describe("preprocessChatMessage", () => {
  it("handles text-only messages correctly", () => {
    const message = "Hello World!";
    const segments = preprocessChatMessage(message);

    expect(segments.length).toBe(1);
    expect(segments[0].content).toBe(message);
    expect(segments[0].isCodeBlock).toBe(false);
  });

  it.only("handles multiline code blocks correctly", () => {
    const message = "```\nconsole.log('Hello World!');\n```";
    const segments = preprocessChatMessage(message);

    console.log(segments);

    expect(segments.length).toBe(1);
    expect(segments[0].content).toBe("console.log('Hello World!');\n");
    expect(segments[0].isCodeBlock).toBe(true);
  });

  it("handles inline code blocks correctly", () => {
    const message = "```console.log('Hello World!')```";
    const segments = preprocessChatMessage(message);

    expect(segments.length).toBe(1);
    expect(segments[0].content).toBe("console.log('Hello World!')");
    expect(segments[0].isCodeBlock).toBe(true);
  });

  it("handles messages starting a code block but not ending it correctly", () => {
    const message = "```console.log('Hello World!')";
    const segments = preprocessChatMessage(message);

    expect(segments.length).toBe(1);
    expect(segments[0].content).toBe("console.log('Hello World!')");
    expect(segments[0].isCodeBlock).toBe(true);
  });

  it("handles regular text followed by code block", () => {
    const message = "Hello World!\n```console.log('Hello World!')";
    const segments = preprocessChatMessage(message);

    expect(segments.length).toBe(2);
    expect(segments[0].content).toBe("Hello World!')");
    expect(segments[0].isCodeBlock).toBe(false);
    expect(segments[1].content).toBe("console.log('Hello World!')");
    expect(segments[1].isCodeBlock).toBe(true);
  });

  it("handles code block followed by regular text", () => {
    const message = "```console.log('Hello World!')```\n\nHello World!";
    const segments = preprocessChatMessage(message);

    expect(segments.length).toBe(2);
    expect(segments[0].content).toBe("console.log('Hello World!')");
    expect(segments[0].isCodeBlock).toBe(true);
    expect(segments[1].content).toBe("Hello World!')");
    expect(segments[1].isCodeBlock).toBe(false);
  });
});
