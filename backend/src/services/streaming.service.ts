import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { ChatGroq } from "@langchain/groq";

const apiKey =
  process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "GROQ_API_KEY is missing from backend/.env"
  );
}

const streamingModel =
  new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    apiKey,
  });

export interface StreamingInput {
  question: string;
  research: string;
  analysis: string;
  history: string;
}

export async function streamFinalAnswer(
  input: StreamingInput,
  onChunk: (chunk: string) => void
) {
  const response =
    await streamingModel.stream([
      new SystemMessage(
        `
You are the final answer generation
agent for NexusAI.

Answer the user's question clearly
and accurately.

Use the research and analysis provided.

Previous conversation may be used
to understand context.

Important rules:

- Do not invent facts.
- Prefer information from the research.
- If the available information is
  insufficient, clearly say so.
- Answer directly.
- Use a professional and natural tone.
- Do not mention internal agents,
  LangGraph, token tracking, or
  implementation details.
        `.trim()
      ),

      new HumanMessage(
        `
Previous Conversation:
${input.history || "No previous conversation."}

Current User Question:
${input.question}

Research:
${input.research || "No research available."}

Analysis:
${input.analysis || "No analysis available."}

Generate the final answer.
        `.trim()
      ),
    ]);

  let fullResponse = "";

  for await (const chunk of response) {
    const content =
      typeof chunk.content === "string"
        ? chunk.content
        : "";

    if (!content) {
      continue;
    }

    fullResponse += content;

    onChunk(content);
  }

  return fullResponse;
}