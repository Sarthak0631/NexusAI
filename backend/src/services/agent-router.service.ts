import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";
import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "GROQ_API_KEY is missing from backend/.env"
  );
}

const routerModel = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
  apiKey,
});

const AgentRouteSchema = z.object({
  route: z.enum([
    "document_search",
    "general",
    "clarification",
  ]),

  reason: z.string(),

  searchQuery: z.string(),
});

const structuredRouter =
  routerModel.withStructuredOutput(
    AgentRouteSchema
  );

export interface AgentRouteDecision {
  route:
    | "document_search"
    | "general"
    | "clarification";

  reason: string;

  searchQuery: string;
}

export async function routeAgentQuestion(
  question: string
): Promise<AgentRouteDecision> {
  const response =
    await structuredRouter.invoke([
      new SystemMessage(
        `You are the routing component of NexusAI.

Your job is to decide what should happen with the user's question.

Choose exactly one route:

1. document_search
Use this when the question asks about information that is likely contained in the user's uploaded documents.

Examples:
- What does the leave policy say?
- What are the benefits mentioned in the document?
- According to the uploaded report, what was the revenue?
- Summarize the uploaded document.

2. general
Use this when the question is general knowledge, casual conversation, programming, explanation, or something that does not require the user's uploaded documents.

Examples:
- What is RAG?
- Explain vector databases.
- What is TypeScript?
- How does JWT authentication work?

3. clarification
Use this when the question is too vague to determine what the user wants.

Examples:
- Tell me more.
- Explain that.
- What about it?

For document_search, generate a concise searchQuery suitable for semantic document retrieval.

For general and clarification, searchQuery should be an empty string.`
      ),

      new HumanMessage(
        question
      ),
    ]);

  return response;
}