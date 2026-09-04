import dotenv from "dotenv";

import {
  StateGraph,
  Annotation,
  START,
  END,
} from "@langchain/langgraph";

import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { ChatGroq } from "@langchain/groq";

import {
  createDocumentSearchTool,
} from "./document-search.tool";

import {
  routeAgentQuestion,
} from "./agent-router.service";

dotenv.config();

const apiKey =
  process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "GROQ_API_KEY is missing from backend/.env"
  );
}

const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
  apiKey,
});

interface AgentMessage {
  role:
    | "user"
    | "assistant"
    | "system";

  content: string;
}

const AgentState = Annotation.Root({
  question: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),

  userId: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),

  route: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),

  routeReason: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),

  searchQuery: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),

  context: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),

  answer: Annotation<string>({
    reducer: (_, value) => value,
    default: () => "",
  }),
});

/* =====================================================
   Router
===================================================== */

async function routerNode(
  state: typeof AgentState.State
) {
  const decision =
    await routeAgentQuestion(
      state.question
    );

  console.log(
    "Agent Route:",
    decision.route
  );

  console.log(
    "Agent Route Reason:",
    decision.reason
  );

  return {
    route: decision.route,
    routeReason: decision.reason,
    searchQuery:
      decision.searchQuery,
  };
}

/* =====================================================
   Document Search
===================================================== */

async function documentSearchNode(
  state: typeof AgentState.State
) {
  const tool =
    createDocumentSearchTool(
      state.userId
    );

  const result =
    await tool.invoke({
      query:
        state.searchQuery ||
        state.question,
    });

  return {
    context: String(result),
  };
}

/* =====================================================
   Direct General Answer
===================================================== */

async function generalAnswerNode(
  state: typeof AgentState.State
) {
  const response =
    await model.invoke([
      new SystemMessage(
        `You are NexusAI, an intelligent research assistant.

Answer the user's question clearly and accurately.

The question does not require information from the user's uploaded documents.

Do not pretend that you searched the user's documents.

If you are uncertain about a factual claim, clearly state the uncertainty.`
      ),

      new HumanMessage(
        state.question
      ),
    ]);

  return {
    answer:
      typeof response.content ===
      "string"
        ? response.content
        : JSON.stringify(
            response.content
          ),
  };
}

/* =====================================================
   Clarification
===================================================== */

async function clarificationNode(
  state: typeof AgentState.State
) {
  return {
    answer:
      "I'd be happy to help. Could you provide a little more detail about what you'd like me to explain?",
  };
}

/* =====================================================
   Document Answer
===================================================== */

async function documentAnswerNode(
  state: typeof AgentState.State
) {
  const response =
    await model.invoke([
      new SystemMessage(
        `You are NexusAI, an intelligent document research assistant.

Answer the user's question using the retrieved document information below.

Rules:

1. Base the answer primarily on the provided document context.
2. Do not invent information that is not supported by the context.
3. If the context does not contain enough information, say so clearly.
4. Provide a concise but useful answer.
5. Do not mention internal agent architecture.
6. Do not mention Pinecone, embeddings, tools, or retrieval unless the user explicitly asks about the system.

Retrieved document context:

${state.context}`
      ),

      new HumanMessage(
        state.question
      ),
    ]);

  return {
    answer:
      typeof response.content ===
      "string"
        ? response.content
        : JSON.stringify(
            response.content
          ),
  };
}

/* =====================================================
   Routing Function
===================================================== */

function routeFromRouter(
  state: typeof AgentState.State
) {
  switch (state.route) {
    case "document_search":
      return "documentSearch";

    case "general":
      return "generalAnswer";

    case "clarification":
      return "clarification";

    default:
      throw new Error(
        `Invalid agent route: ${state.route}`
      );
  }
}

/* =====================================================
   Graph
===================================================== */

const workflow =
  new StateGraph(AgentState)
    .addNode(
      "router",
      routerNode
    )

    .addNode(
      "documentSearch",
      documentSearchNode
    )

    .addNode(
      "documentAnswer",
      documentAnswerNode
    )

    .addNode(
      "generalAnswer",
      generalAnswerNode
    )

    .addNode(
      "clarification",
      clarificationNode
    )

    .addEdge(
      START,
      "router"
    )

    .addConditionalEdges(
      "router",
      routeFromRouter
    )

    .addEdge(
      "documentSearch",
      "documentAnswer"
    )

    .addEdge(
      "documentAnswer",
      END
    )

    .addEdge(
      "generalAnswer",
      END
    )

    .addEdge(
      "clarification",
      END
    );

const agentGraph =
  workflow.compile();

/* =====================================================
   Public Function
===================================================== */

export async function runAgent(
  question: string,
  userId: string
) {
  const result =
    await agentGraph.invoke({
      question,
      userId,
    });

  return {
    answer: result.answer,

    route: result.route,

    routeReason:
      result.routeReason,

    searchQuery:
      result.searchQuery,

    context:
      result.context,
  };
}