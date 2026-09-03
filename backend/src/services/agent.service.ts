import {
  StateGraph,
  Annotation,
  START,
} from "@langchain/langgraph";

import {
  ToolNode,
  toolsCondition,
} from "@langchain/langgraph/prebuilt";

import {
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

import { ChatGroq } from "@langchain/groq";

import { createDocumentSearchTool } from "./document-search.tool";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error(
    "GROQ_API_KEY is missing from backend/.env"
  );
}


const AgentState = Annotation.Root({
  messages: Annotation<any[]>({
    reducer: (previous, next) => [
      ...previous,
      ...next,
    ],

    default: () => [],
  }),
});


const model = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0,
  apiKey,
});


async function agentNode(
  state: typeof AgentState.State,
  userId: string
) {
  console.log("Agent: Thinking...");

  const searchTool =
    createDocumentSearchTool(userId);

  const modelWithTools =
    model.bindTools([
      searchTool,
    ]);

  const response =
    await modelWithTools.invoke(
      state.messages
    );

  return {
    messages: [response],
  };
}


function createToolNode(
  userId: string
) {
  const searchTool =
    createDocumentSearchTool(userId);

  return new ToolNode([
    searchTool,
  ]);
}


export async function runAgent(
  question: string,
  userId: string
) {
  const toolNode =
    createToolNode(userId);

  const workflow =
    new StateGraph(
      AgentState
    )
      .addNode(
        "agent",
        (state) =>
          agentNode(
            state,
            userId
          )
      )

      .addNode(
        "tools",
        toolNode
      )

      .addEdge(
        START,
        "agent"
      )

      .addConditionalEdges(
        "agent",
        toolsCondition
      )

      .addEdge(
        "tools",
        "agent"
      );


  const app =
    workflow.compile();


  const result =
    await app.invoke({
      messages: [
        new SystemMessage(
          `You are NexusAI, an intelligent AI research assistant.

You have access to a tool called search_documents.

Use search_documents when the user's question requires information from their uploaded documents.

If the user asks something that can be answered without their documents, you may answer directly.

Never invent information from documents that you have not retrieved.

Give clear and concise answers.`
        ),

        new HumanMessage(
          question
        ),
      ],
    });


  const lastMessage =
    result.messages[
      result.messages.length - 1
    ];


  return {
    answer:
      typeof lastMessage.content ===
      "string"
        ? lastMessage.content
        : JSON.stringify(
            lastMessage.content
          ),
  };
}