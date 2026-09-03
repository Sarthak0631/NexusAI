import { chunkText } from "./chunking.service";
import { generateEmbedding } from "./embedding.service";
import { getPineconeIndex } from "./pinecone.service";

interface IngestDocumentParams {
  documentId: string;
  userId: string;
  text: string;
}

export async function ingestDocument({
  documentId,
  userId,
  text,
}: IngestDocumentParams) {
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    throw new Error("No chunks were created from the document");
  }

  const index = getPineconeIndex();

  const namespace = index.namespace(`user_${userId}`);

  const vectors = [];

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content);

    vectors.push({
      id: `${documentId}-chunk-${chunk.chunkIndex}`,
      values: embedding,
      metadata: {
        documentId,
        userId,
        chunkIndex: chunk.chunkIndex,
        text: chunk.content,
      },
    });
  }

  if (vectors.length === 0) {
    throw new Error("No vectors were generated");
  }

  await namespace.upsert({
    records: vectors,
  });

  return {
    totalChunks: chunks.length,
    namespace: `user_${userId}`,
  };
}