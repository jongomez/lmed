// Inspired by: https://github.com/Nutlope/twitterbio/

import {
  OpenAIStream,
  OpenAIStreamPayload,
  streamMock,
} from "@/utils/backendUtils";
import { NextResponse } from "next/server";
import { dummyBotMessages } from "./dummyResponses";

const MAX_REQUEST_BODY_LENGTH = 999_999;
const USE_DUMMY_MESSAGES = false;

export const config = {
  runtime: "edge",
};

export const POST = async (req: Request) => {
  const { messages, keys } = await req.json();

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY || keys[0];

  if (!OPENAI_API_KEY) {
    console.error("Missing OpenAI API key");
    return NextResponse.json(
      {
        error: "Missing OpenAI API key.",
      },
      { status: 500 }
    );
  }

  const requestBodyLength = JSON.stringify({ messages, keys }).length;

  if (requestBodyLength > MAX_REQUEST_BODY_LENGTH) {
    console.error(
      `Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.`
    );
    return NextResponse.json(
      {
        error: `Request body exceeds ${MAX_REQUEST_BODY_LENGTH} characters.`,
      },
      { status: 400 }
    );
  }

  if (!messages || messages.length === 0) {
    return NextResponse.json(
      {
        error: "No messages found in the request.",
      },
      { status: 400 }
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Input messages (with initial bot message):", messages);
  }

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 200,
    stream: true,
    n: 1,
  };

  if (USE_DUMMY_MESSAGES) {
    const STREAM = true;
    const message = dummyBotMessages[0];

    if (STREAM) {
      const readable = streamMock(message.split(" "));

      return new Response(readable);
    } else {
      return new Response(message);
    }
  }

  try {
    const stream = await OpenAIStream(payload, OPENAI_API_KEY);

    return new Response(stream);
  } catch (e) {
    return NextResponse.json(
      {
        error: "Error streaming OpenAI response.",
      },
      { status: 500 }
    );
  }
};
