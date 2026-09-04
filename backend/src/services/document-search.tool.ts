import { tool } from "@langchain/core/tools";
import { z } from "zod";

import {
  retrieveAndRerankChunks,
} from "./retrieval.service";

export function createDocumentSearchTool(userId: string) {
  return tool(
    async ({ query }) => {
      console.log(
        "Agent Tool: Searching documents..."
      );

      const chunks =
        await retrieveAndRerankChunks(
          query,
          userId,
          10,
          5
        );

      if (chunks.length === 0) {
        return "No relevant information was found in the uploaded documents.";
      }

      return chunks
        .map(
          (chunk, index) =>
            `[Source ${index + 1}]\n${chunk.text}`
        )
        .join("\n\n");
    },
    {
      name: "search_documents",

      description:
        "Search the user's uploaded documents for relevant information. Use this tool when the answer may be found in the user's documents.",

      schema: z.object({
        query: z
          .string()
          .describe(
            "The search query to use against the user's uploaded documents"
          ),
      }),
    }
  );
}