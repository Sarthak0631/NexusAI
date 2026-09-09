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

  /*
    Names of the documents the user scoped
    the question to. Empty means the whole
    knowledge base was searched.
  */
  scopedDocumentNames?: string[];
}

function buildScopeRules(
  scopedDocumentNames?: string[]
) {
  if (
    !scopedDocumentNames ||
    scopedDocumentNames.length === 0
  ) {
    return "";
  }

  return `

The user restricted this question to the
following document(s):

${scopedDocumentNames
      .map((name) => `- ${name}`)
      .join("\n")}

Additional rules for this answer:

- Answer only from the research above,
  which comes from those documents.
- Do not use outside or general knowledge.
- If the documents do not contain the
  answer, say that the selected document(s)
  do not cover it instead of guessing.`;
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
${buildScopeRules(input.scopedDocumentNames)}
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