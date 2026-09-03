export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  llmCalls: number;
}

export function createEmptyTokenUsage(): TokenUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    llmCalls: 0,
  };
}

export function addTokenUsage(
  current: TokenUsage,
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  }
): TokenUsage {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  const totalTokens =
    usage.totalTokens ??
    inputTokens + outputTokens;

  return {
    inputTokens:
      current.inputTokens + inputTokens,

    outputTokens:
      current.outputTokens + outputTokens,

    totalTokens:
      current.totalTokens + totalTokens,

    llmCalls:
      current.llmCalls + 1,
  };
}

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export function calculateEstimatedCost(
  usage: TokenUsage,
  inputPricePerMillionTokens: number,
  outputPricePerMillionTokens: number
): CostEstimate {
  const inputCost =
    (usage.inputTokens / 1_000_000) *
    inputPricePerMillionTokens;

  const outputCost =
    (usage.outputTokens / 1_000_000) *
    outputPricePerMillionTokens;

  return {
    inputCost,
    outputCost,
    totalCost:
      inputCost + outputCost,
  };
}