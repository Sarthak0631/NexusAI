import DocumentModel from "../models/Document";

export interface SourceReference {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  score: number;
  text: string;
}

export async function buildSourceReferences(
  chunks: {
    text: string;
    score: number;
    documentId: string;
    chunkIndex: number;
  }[]
): Promise<SourceReference[]> {
  if (chunks.length === 0) {
    return [];
  }

  const documentIds = [
    ...new Set(
      chunks.map(
        (chunk) => chunk.documentId
      )
    ),
  ];

  const documents =
    await DocumentModel.find({
      _id: {
        $in: documentIds,
      },
    }).select(
      "_id originalName name"
    );

  const documentMap =
    new Map<
      string,
      {
        originalName: string;
        name: string;
      }
    >();

  for (const document of documents) {
    documentMap.set(
      document._id.toString(),
      {
        originalName:
          document.originalName,
        name: document.name,
      }
    );
  }

  return chunks.map(
    (chunk) => {
      const document =
        documentMap.get(
          chunk.documentId
        );

      return {
        documentId:
          chunk.documentId,

        documentName:
          document?.originalName ??
          document?.name ??
          "Unknown document",

        chunkIndex:
          chunk.chunkIndex,

        score: chunk.score,

        text: chunk.text,
      };
    }
  );
}