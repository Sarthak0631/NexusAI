export interface ChatMessage {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  sources?: SourceReference[];
}

export interface Conversation {
  _id: string;
  title: string;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResponse {
  success: boolean;
  conversations: Conversation[];
}

export interface ConversationResponse {
  success: boolean;
  conversation: Conversation;
}

export interface MultiAgentResponse {
  success: boolean;
  question: string;
  conversationId: string;
  answer: string;
  research?: string;
  analysis?: string;
  supervisorDecision?: string;

  sources?: SourceReference[];

  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    llmCalls: number;
  };

  cost?: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };

  message?: string;
}

export interface SourceReference {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  score: number;
  text: string;
}

export interface DocumentDetails {
  _id: string;
  originalName: string;
  name: string;
  mimeType: string;
  size: number;
  status: string;
  extractedText: string;
  createdAt: string;
}