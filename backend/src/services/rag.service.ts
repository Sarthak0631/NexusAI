import {
  retrieveAndRerankChunks,
  RetrievedChunk,
} from "./retrieval.service";

import {
  generateAIResponse,
  ChatMessage,
} from "./llm.service";

export interface RAGResponse {
  answer: string;
  sources: RetrievedChunk[];
}

export async function generateRAGResponse(
  question: string,
  userId: string
): Promise<RAGResponse> {
  // 1. Retrieve relevant document chunks
  const relevantChunks = await retrieveAndRerankChunks(
    question,
    userId,
    10,
    3
  );

  // 2. Make sure we found something
  if (relevantChunks.length === 0) {
    return {
      answer:
        "I couldn't find relevant information in your uploaded documents.",
      sources: [],
    };
  }

  // 3. Build context from retrieved chunks
  const context = relevantChunks
    .map(
      (chunk, index) =>
        `[Source ${index + 1}]\n${chunk.text}`
    )
    .join("\n\n");

  // 4. Create prompt for Groq
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `
You are NexusAI, an intelligent document research assistant.

Answer the user's question using ONLY the information
provided in the document context.

If the answer cannot be found in the context,
clearly say that the information is not available
in the uploaded documents.

Do not make up facts.

Keep the answer clear, concise, and helpful.
      `.trim(),
    },
    {
      role: "user",
      content: `
Document Context:

${context}

User Question:

${question}

Answer the question using the document context above.
      `.trim(),
    },
  ];

  // 5. Ask Groq to generate the final answer
  const result = await generateAIResponse(messages);

  return {
    answer: result.content,
    sources: relevantChunks,
  };
}