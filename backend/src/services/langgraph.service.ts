import {
    StateGraph,
    Annotation,
    START,
    END,
} from "@langchain/langgraph";

import { retrieveRelevantChunks } from "./retrieval.service";

import {
    generateAIResponse,
    ChatMessage,
} from "./llm.service";

const GraphState = Annotation.Root({
    question: Annotation<string>,

    userId: Annotation<string>,

    context: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    answer: Annotation<string>({
        reducer: (_, value) => value,
        default: () => "",
    }),

    bestScore: Annotation<number>({
        reducer: (_, value) => value,
        default: () => 0,
    }),

    isRelevant: Annotation<boolean>({
        reducer: (_, value) => value,
        default: () => false,
    }),
});


async function retrieveNode(
    state: typeof GraphState.State
) {
    console.log("LangGraph: Retrieving documents...");

    const chunks = await retrieveRelevantChunks(
        state.question,
        state.userId,
        5
    );

    if (chunks.length === 0) {
        return {
            context: "",
            bestScore: 0,
            isRelevant: false,
        };
    }

    const context = chunks
        .map(
            (chunk, index) =>
                `[Source ${index + 1}]\n${chunk.text}`
        )
        .join("\n\n");

    const bestScore = chunks[0]?.score ?? 0;

    const isRelevant = bestScore >= 0.45;

    console.log(
        `LangGraph: Best retrieval score = ${bestScore}`
    );

    console.log(
        `LangGraph: Relevant = ${isRelevant}`
    );

    return {
        context,
        bestScore,
        isRelevant,
    };
}


async function generateNode(
    state: typeof GraphState.State
) {
    console.log("LangGraph: Generating answer...");

    const messages: ChatMessage[] = [
        {
            role: "system",
            content: `
You are NexusAI, an intelligent document research assistant.

Answer the user's question using ONLY the provided document context.

If the answer cannot be found in the context,
say that the information is not available
in the uploaded documents.

Do not make up facts.

Keep the answer clear and concise.
      `.trim(),
        },

        {
            role: "user",
            content: `
Document Context:

${state.context}

User Question:

${state.question}

Answer using the document context above.
      `.trim(),
        },
    ];

    const result = await generateAIResponse(messages);

    return {
        answer: result.content,
    };
}


async function fallbackNode(
    state: typeof GraphState.State
) {
    console.log(
        "LangGraph: Retrieved information is not relevant."
    );

    return {
        answer:
            "I couldn't find enough relevant information in your uploaded documents to answer this question.",
    };
}


function routeAfterRetrieval(
    state: typeof GraphState.State
) {
    if (state.isRelevant) {
        return "generate";
    }

    return "fallback";
}


const workflow = new StateGraph(GraphState)
    .addNode("retrieve", retrieveNode)
    .addNode("generate", generateNode)
    .addNode("fallback", fallbackNode)

    .addEdge(START, "retrieve")

    .addConditionalEdges(
        "retrieve",
        routeAfterRetrieval,
        {
            generate: "generate",
            fallback: "fallback",
        }
    )

    .addEdge("generate", END)
    .addEdge("fallback", END);


const app = workflow.compile();


export async function runLangGraphRAG(
    question: string,
    userId: string
) {
    const result = await app.invoke({
        question,
        userId,
    });

    return {
        answer: result.answer,
        context: result.context,
        bestScore: result.bestScore,
        isRelevant: result.isRelevant,
    };
}