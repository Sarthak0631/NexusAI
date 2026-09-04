import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

import { retrieveAndRerankChunks } from "./retrieval.service";
import { generateAIResponse } from "./llm.service";

const ragPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are NexusAI, an intelligent document research assistant.

Answer the user's question using ONLY the information provided in the document context.

If the answer cannot be found in the context, clearly say that the information is not available in the uploaded documents.

Do not make up facts.

Keep the answer clear, concise and helpful.`,
  ],
  [
    "human",
    `Document Context:

{context}

User Question:

{question}

Answer the question using the document context above.`,
  ],
]);

const ragChain = RunnableSequence.from([
  ragPrompt,
  async (messages) => {
    const result = await generateAIResponse(
      messages.messages.map((message: any) => ({
        role:
          message._getType() === "system"
            ? "system"
            : message._getType() === "human"
            ? "user"
            : "assistant",
        content: message.content,
      }))
    );

    return result.content;
  },
  new StringOutputParser(),
]);

export async function generateLangChainRAGResponse(
  question: string,
  userId: string
) {
  const relevantChunks = await retrieveAndRerankChunks(
    question,
    userId,
    10,
    3
  );

  if (relevantChunks.length === 0) {
    return {
      answer:
        "I couldn't find relevant information in your uploaded documents.",
      sources: [],
    };
  }

  const context = relevantChunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}]\n${chunk.text}`
    )
    .join("\n\n");

  const answer = await ragChain.invoke({
    context,
    question,
  });

  return {
    answer,
    sources: relevantChunks,
  };
}