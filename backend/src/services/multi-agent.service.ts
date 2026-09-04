import dotenv from "dotenv";
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import {
    HumanMessage,
    SystemMessage,
} from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

import {
    retrieveAndRerankChunks,
} from "./retrieval.service";

import {
    createEmptyTokenUsage,
    addTokenUsage,
    calculateEstimatedCost,
    TokenUsage,
} from "./cost-tracking.service";

dotenv.config();

/* =========================================================
   Environment Configuration
========================================================= */

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
    throw new Error(
        "GROQ_API_KEY is missing from backend/.env"
    );
}

/* =========================================================
   LLM Configuration
========================================================= */

const model = new ChatGroq({
    model: "openai/gpt-oss-20b",
    temperature: 0,
    apiKey,
});

/* =========================================================
   Supervisor Structured Output Schema
========================================================= */

const SupervisorDecisionSchema = z.object({
    nextAgent: z.enum([
        "research",
        "summarizer",
    ]),

    reason: z.string(),
});

/*
  includeRaw: true allows us to access:

  response.parsed
  response.raw

  We need response.raw so that we can track
  token usage from the supervisor LLM call.
*/

const supervisorModel = model.withStructuredOutput(
    SupervisorDecisionSchema,
    {
        includeRaw: true,
    }
);

/* =========================================================
   Multi-Agent State
========================================================= */

const MultiAgentState = Annotation.Root({
    /*
      Original user question
    */
    question: Annotation<string>,

    /*
      Authenticated user ID
  
      Used to make sure document retrieval
      only searches the current user's documents.
    */
    userId: Annotation<string>,

    history: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    /*
      Research Agent output
    */
    research: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    /*
      Analyst Agent output
    */
    analysis: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    /*
      Final Summarizer Agent output
    */
    summary: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    /*
      Supervisor routing decision
    */
    nextAgent: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    /*
      Human-readable reason for supervisor decision
    */
    supervisorDecision: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    /*
      Cumulative token usage across all LLM calls
    */
    usage: Annotation<TokenUsage>({
        reducer: (_, value) => value,
        default: () => createEmptyTokenUsage(),
    }),
});

/* =========================================================
   Helper: Convert LangChain Usage Metadata
========================================================= */

function extractTokenUsage(
    usageMetadata: any
): {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
} {
    if (!usageMetadata) {
        return {
            inputTokens: 0,
            outputTokens: 0,
            totalTokens: 0,
        };
    }

    const inputTokens =
        Number(
            usageMetadata.input_tokens ??
            usageMetadata.prompt_tokens ??
            0
        );

    const outputTokens =
        Number(
            usageMetadata.output_tokens ??
            usageMetadata.completion_tokens ??
            0
        );

    const totalTokens =
        Number(
            usageMetadata.total_tokens ??
            inputTokens + outputTokens
        );

    return {
        inputTokens,
        outputTokens,
        totalTokens,
    };
}

/* =========================================================
   1. Supervisor Agent
========================================================= */

async function supervisorAgent(
    state: typeof MultiAgentState.State
) {
    console.log(
        "\n========== SUPERVISOR AGENT =========="
    );

    try {
        const response = await supervisorModel.invoke([
            new SystemMessage(
                `
                You are the Supervisor Agent in a multi-agent
                research and knowledge system.

                Your job is to decide what the workflow should do next.

                Available agents:

                1. research
                - Searches the user's uploaded documents.
                - Use this when information from the user's documents
                    may be required.

                2. summarizer
                - Produces the final answer.
                - Use this only when the workflow already has enough
                    information to answer the user's question.

                For the initial request:

                - If the question requires information from uploaded
                documents, choose "research".
                - If sufficient information already exists in the workflow
                state, choose "summarizer".

                Return only the structured decision requested by the schema.
                        `.trim()
            ),

            new HumanMessage(
                `
                Previous Conversation:
                ${state.history || "No previous conversation."}

                User Question:
                ${state.question}

                Current Research:
                ${state.research || "No research available yet."}

                Current Analysis:
                ${state.analysis || "No analysis available yet."}

                Current Summary:
                ${state.summary || "No summary available yet."}

                Current Workflow State:
                - Research available: ${Boolean(state.research)}
                - Analysis available: ${Boolean(state.analysis)}
                - Summary available: ${Boolean(state.summary)}

                Decide the next agent.
                `
            )
        ]);

        /*
          With includeRaw: true, response contains:
    
          response.parsed
          response.raw
        */

        const parsed = response.parsed;

        if (!parsed) {
            throw new Error(
                "Supervisor did not return a valid structured decision"
            );
        }

        const rawUsage = (
            response.raw as any
        )?.usage_metadata;

        const usage = extractTokenUsage(rawUsage);

        const updatedUsage = addTokenUsage(
            state.usage,
            usage
        );

        console.log(
            "Supervisor Decision:",
            parsed.nextAgent
        );

        console.log(
            "Supervisor Reason:",
            parsed.reason
        );

        console.log(
            "Supervisor Token Usage:",
            usage
        );

        return {
            nextAgent: parsed.nextAgent,

            supervisorDecision:
                parsed.reason,

            usage: updatedUsage,
        };
    } catch (error) {
        console.error(
            "Supervisor Agent Error:",
            error
        );

        throw error;
    }
}

/* =========================================================
   2. Research Agent
========================================================= */

async function researchAgent(
    state: typeof MultiAgentState.State
) {
    console.log(
        "\n========== RESEARCH AGENT =========="
    );

    try {
        /*
          Retrieve only the top 3 chunks.
    
          This keeps the context smaller and helps
          stay within Groq token-per-minute limits.
        */

        const chunks =
            await retrieveAndRerankChunks(
                state.question,
                state.userId,
                10,
                3
            );

        if (chunks.length === 0) {
            console.log(
                "Research Agent: No relevant documents found."
            );

            return {
                research:
                    "No relevant information was found in the user's uploaded documents.",
            };
        }

        /*
          Limit each chunk to 1200 characters.
    
          This prevents unnecessarily large prompts.
        */

        const research =
            chunks
                .map(
                    (chunk, index) =>
                        `[Source ${index + 1}]
                            Document: ${chunk.documentName ??
                                                    "Unknown document"
                                                    }

                            Vector Score: ${chunk.vectorScore.toFixed(3)
                                                    }

                            Keyword Score: ${chunk.keywordScore.toFixed(3)
                                                    }

                            Rerank Score: ${chunk.rerankScore.toFixed(3)
                                                    }

                            Content:
                            ${chunk.text.slice(
                            0,
                            1200
                        )}`
                )
                .join("\n\n");

        console.log(
            `Research Agent: Found ${chunks.length} relevant chunks`
        );

        return {
            research,
        };
    } catch (error) {
        console.error(
            "Research Agent Error:",
            error
        );

        throw error;
    }
}

/* =========================================================
   3. Analyst Agent
========================================================= */

async function analystAgent(
    state: typeof MultiAgentState.State
) {
    console.log(
        "\n========== ANALYST AGENT =========="
    );

    try {
        const response = await model.invoke([
            new SystemMessage(
                `
                You are the Analyst Agent in a multi-agent
                research and knowledge system.

                Your job is to analyze the information retrieved
                from the user's uploaded documents.

                Instructions:

                - Carefully examine the research.
                - Identify information relevant to the user's question.
                - Remove irrelevant information.
                - Resolve contradictions when possible.
                - Do not invent facts.
                - Base your analysis only on the supplied research.
                - Explain what information should be used to answer
                the user's question.
                `.trim()
            ),

            new HumanMessage(
                `
                    Previous Conversation:
                    ${state.history || "No previous conversation."}

                    Current User Question:
                    ${state.question}

                    Research Results:
                    ${state.research || "No research was available."}

                    Use the previous conversation only to understand
                    the context of the current question.

                    Analyze the research and provide a concise,
                    fact-based analysis.

                    Do not invent information that is not present
                    in the research.
                    `
            )
        ]);

        const analysis =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

        /*
          Extract token usage from the analyst call.
        */

        const usageMetadata =
            response.usage_metadata;

        const usage =
            extractTokenUsage(usageMetadata);

        const updatedUsage =
            addTokenUsage(
                state.usage,
                usage
            );

        console.log(
            "Analyst Token Usage:",
            usage
        );

        return {
            analysis,
            usage: updatedUsage,
        };
    } catch (error) {
        console.error(
            "Analyst Agent Error:",
            error
        );

        throw error;
    }
}

/* =========================================================
   4. Summarizer Agent
========================================================= */

async function summarizerAgent(
    state: typeof MultiAgentState.State
) {
    console.log(
        "\n========== SUMMARIZER AGENT =========="
    );

    try {
        const response = await model.invoke([
            new SystemMessage(
                `
                    You are the Final Summarizer Agent in a
                    multi-agent research and knowledge system.

                    Your job is to produce the final answer for the user.

                    Instructions:

                    - Answer the user's question directly.
                    - Use the analyst's conclusions as the primary guide.
                    - Use the research when necessary.
                    - Do not invent information.
                    - If the documents do not contain enough information,
                    clearly say so.
                    - Keep the answer clear and useful.
                    - Use a professional and natural tone.
                    - Do not mention internal agents, LangGraph,
                    token usage, or workflow implementation.
            `.trim()
            ),

            new HumanMessage(
                `
                Previous Conversation:
                ${state.history || "No previous conversation."}

                Current User Question:
                ${state.question}

                Research:
                ${state.research || "No research available."}

                Analysis:
                ${state.analysis || "No analysis available."}

                Generate the final answer for the current user question.

                Use the previous conversation to understand references
                such as "it", "they", "this", "that", or follow-up
                questions.

                However, always prioritize the current question
                and the retrieved document information.

                Do not invent facts.
                `
            )
        ]);

        const summary =
            typeof response.content === "string"
                ? response.content
                : JSON.stringify(response.content);

        /*
          Extract token usage from summarizer call.
        */

        const usageMetadata =
            response.usage_metadata;

        const usage =
            extractTokenUsage(usageMetadata);

        const updatedUsage =
            addTokenUsage(
                state.usage,
                usage
            );

        console.log(
            "Summarizer Token Usage:",
            usage
        );

        return {
            summary,
            usage: updatedUsage,
        };
    } catch (error) {
        console.error(
            "Summarizer Agent Error:",
            error
        );

        throw error;
    }
}

/* =========================================================
   Supervisor Routing
========================================================= */

function routeFromSupervisor(
    state: typeof MultiAgentState.State
) {
    switch (state.nextAgent) {
        case "research":
            return "researchAgent";

        case "summarizer":
            return "summarizerAgent";

        default:
            throw new Error(
                `Invalid supervisor decision: ${state.nextAgent}`
            );
    }
}

/* =========================================================
   Build LangGraph Workflow
========================================================= */

/*
  Workflow:

                    START
                      |
                      v
                SUPERVISOR
                  /     \
                 /       \
                v         v
        RESEARCH AGENT   SUMMARIZER
              |
              v
        ANALYST AGENT
              |
              v
        SUMMARIZER AGENT
              |
              v
             END

  In the normal document-research flow:

  1. Supervisor
  2. Research
  3. Analyst
  4. Summarizer

  Only 3 of these are LLM calls because
  Research uses embeddings + Pinecone.
*/

const workflow =
    new StateGraph(
        MultiAgentState
    )
        /*
          Register nodes
        */

        .addNode(
            "supervisor",
            supervisorAgent
        )

        .addNode(
            "researchAgent",
            researchAgent
        )

        .addNode(
            "analystAgent",
            analystAgent
        )

        .addNode(
            "summarizerAgent",
            summarizerAgent
        )

        /*
          START → Supervisor
        */

        .addEdge(
            START,
            "supervisor"
        )

        /*
          Supervisor decides the next node.
        */

        .addConditionalEdges(
            "supervisor",
            routeFromSupervisor
        )

        /*
          Research → Analyst
        */

        .addEdge(
            "researchAgent",
            "analystAgent"
        )

        /*
          Analyst → Summarizer
        */

        .addEdge(
            "analystAgent",
            "summarizerAgent"
        )

        /*
          Summarizer → END
        */

        .addEdge(
            "summarizerAgent",
            END
        );

/* =========================================================
   Compile Graph
========================================================= */

const multiAgentGraph =
    workflow.compile();

/* =========================================================
   Public Function
========================================================= */

export async function runMultiAgent(
    question: string,
    userId: string,
    history: string = ""
) {
    console.log(
        "\n========================================"
    );

    console.log(
        "Starting Multi-Agent Workflow"
    );

    console.log(
        "Question:",
        question
    );

    console.log(
        "User ID:",
        userId
    );

    console.log(
        "========================================\n"
    );

    /*
      Run the LangGraph workflow.
    */

    const result =
        await multiAgentGraph.invoke({
            question,
            userId,

            history,

            research: "",
            analysis: "",
            summary: "",

            nextAgent: "",

            supervisorDecision: "",

            usage:
                createEmptyTokenUsage(),
        });

    /*
      Read pricing from environment variables.
  
      For now these can be 0 because the current
      Groq setup may be using a free quota.
  
      You can later configure actual pricing.
    */

    const inputPrice =
        Number(
            process.env
                .LLM_INPUT_PRICE_PER_MILLION ?? 0
        );

    const outputPrice =
        Number(
            process.env
                .LLM_OUTPUT_PRICE_PER_MILLION ?? 0
        );

    /*
      Calculate estimated cost.
    */

    const cost =
        calculateEstimatedCost(
            result.usage,
            inputPrice,
            outputPrice
        );

    console.log(
        "\n========== WORKFLOW COMPLETED =========="
    );

    console.log(
        "LLM Calls:",
        result.usage.llmCalls
    );

    console.log(
        "Input Tokens:",
        result.usage.inputTokens
    );

    console.log(
        "Output Tokens:",
        result.usage.outputTokens
    );

    console.log(
        "Total Tokens:",
        result.usage.totalTokens
    );

    console.log(
        "Estimated Cost:",
        cost.totalCost
    );

    console.log(
        "=========================================\n"
    );

    /*
      Return everything useful to the controller.
    */

    return {
        answer: result.summary,

        research: result.research,

        analysis: result.analysis,

        supervisorDecision:
            result.supervisorDecision,

        usage: result.usage,

        cost,
    };
}