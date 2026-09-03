export interface TextChunk {
  content: string;
  chunkIndex: number;
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(text: string): TextChunk[] {
  const chunks: TextChunk[] = [];

  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) {
    return chunks;
  }

  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      cleanedText.length
    );

    const content = cleanedText.slice(start, end).trim();

    if (content) {
      chunks.push({
        content,
        chunkIndex,
      });
    }

    if (end >= cleanedText.length) {
      break;
    }

    start = end - CHUNK_OVERLAP;
    chunkIndex++;
  }

  return chunks;
}