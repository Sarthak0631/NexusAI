import { generateEmbedding } from "./embedding.service";
import { getPineconeIndex } from "./pinecone.service";

export interface RetrievedChunk {
  text: string;
  score: number;
  documentId: string;
  chunkIndex: number;
}

export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
  // 1. Convert the user's question into an embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Get Pinecone index
  const index = getPineconeIndex();

  // 3. Use the user's namespace
  const namespace = index.namespace(`user_${userId}`);

  // 4. Search for similar vectors
  const searchResult = await namespace.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  // 5. Convert Pinecone results into our application format
  const results: RetrievedChunk[] = [];

  for (const match of searchResult.matches ?? []) {
    const metadata = match.metadata;

    if (!metadata) {
      continue;
    }

    results.push({
      text: String(metadata.text ?? ""),
      score: match.score ?? 0,
      documentId: String(metadata.documentId ?? ""),
      chunkIndex: Number(metadata.chunkIndex ?? 0),
    });
  }

  return results;
}