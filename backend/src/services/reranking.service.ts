import type {
    RetrievedChunk,
} from "./retrieval.service";

function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function tokenize(text: string): string[] {
    return normalizeText(text)
        .split(" ")
        .filter((word) => word.length >= 3);
}

function calculateKeywordScore(
    query: string,
    text: string
): number {
    const queryTokens = [
        ...new Set(tokenize(query)),
    ];

    const textTokens = new Set(
        tokenize(text)
    );

    if (queryTokens.length === 0) {
        return 0;
    }

    let matchedTokens = 0;

    for (const token of queryTokens) {
        if (textTokens.has(token)) {
            matchedTokens++;
        }
    }

    return matchedTokens / queryTokens.length;
}

export interface RerankedChunk
    extends RetrievedChunk {
    vectorScore: number;
    keywordScore: number;
    rerankScore: number;
}

export function rerankChunks(
    query: string,
    chunks: RetrievedChunk[]
): RerankedChunk[] {
    if (chunks.length === 0) {
        return [];
    }

    const reranked = chunks.map(
        (chunk) => {
            const vectorScore =
                Math.max(
                    0,
                    Math.min(
                        1,
                        chunk.score
                    )
                );

            const keywordScore =
                calculateKeywordScore(
                    query,
                    chunk.text
                );

            const rerankScore =
                vectorScore * 0.7 +
                keywordScore * 0.3;

            return {
                ...chunk,
                vectorScore,
                keywordScore,
                rerankScore,
            };
        }
    );

    const sorted =
        reranked.sort(
            (a, b) =>
                b.rerankScore -
                a.rerankScore
        );

    console.log(
        "Reranking Results:"
    );

    sorted.forEach(
        (chunk, index) => {
            console.log({
                rank: index + 1,
                vectorScore:
                    chunk.vectorScore.toFixed(3),
                keywordScore:
                    chunk.keywordScore.toFixed(3),
                rerankScore:
                    chunk.rerankScore.toFixed(3),
                chunkIndex:
                    chunk.chunkIndex,
            });
        }
    );

    return sorted;
}