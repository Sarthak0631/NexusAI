import {
    ConversationListResponse,
    ConversationResponse,
    MultiAgentResponse,
} from "../types/chat";

import { API_URL } from "./api.config";

export async function getConversations(): Promise<ConversationListResponse> {
  try {
    const response = await fetch(
      `${API_URL}/conversations`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          `Failed to fetch conversations (${response.status})`
      );
    }

    return data;
  } catch (error) {
    console.error(
      "getConversations API error:",
      error
    );

    throw error;
  }
}

export async function createConversation(
    title: string = "New Conversation"
): Promise<ConversationResponse> {
    const response = await fetch(
        `${API_URL}/conversations`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                title,
            }),
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to create conversation"
        );
    }

    return data;
}

export async function getConversation(
    conversationId: string
): Promise<ConversationResponse> {
    const response = await fetch(
        `${API_URL}/conversations/${conversationId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to fetch conversation"
        );
    }

    return data;
}

export async function askMultiAgent(
    conversationId: string,
    question: string
): Promise<MultiAgentResponse> {
    const response = await fetch(
        `${API_URL}/multi-agent/ask`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                conversationId,
                question,
            }),
        }
    );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Failed to process question"
        );
    }

    return data;
}

export async function streamMultiAgentAnswer(
    conversationId: string,
    question: string,
    onChunk: (chunk: string) => void,
    onComplete?: (
        sources?: import("../types/chat").SourceReference[]
    ) => void
) {
    const response = await fetch(
        `${API_URL}/streaming/ask`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                conversationId,
                question,
            }),
        }
    );

    if (!response.ok) {
        let message =
            "Failed to stream AI response";

        try {
            const data =
                await response.json();

            message =
                data.message || message;
        } catch {
            // Ignore JSON parsing errors
        }

        throw new Error(message);
    }

    if (!response.body) {
        throw new Error(
            "Streaming is not supported by this response"
        );
    }

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder("utf-8");

    let buffer = "";

    try {
        while (true) {
            const {
                value,
                done,
            } = await reader.read();

            if (done) {
                break;
            }

            buffer += decoder.decode(
                value,
                {
                    stream: true,
                }
            );

            const events =
                buffer.split("\n\n");

            buffer =
                events.pop() || "";

            for (const event of events) {
                const lines =
                    event.split("\n");

                let eventType = "";
                let data = "";

                for (const line of lines) {
                    if (line.startsWith("event:")) {
                        eventType =
                            line
                                .slice(6)
                                .trim();
                    }

                    if (line.startsWith("data:")) {
                        data +=
                            line
                                .slice(5)
                                .trim();
                    }
                }

                if (!data) {
                    continue;
                }

                try {
                    const parsed =
                        JSON.parse(data);

                    if (
                        eventType === "chunk" &&
                        typeof parsed.content ===
                        "string"
                    ) {
                        onChunk(
                            parsed.content
                        );
                    }

                    if (
                        eventType === "error"
                    ) {
                        throw new Error(
                            parsed.message ||
                            "Streaming failed"
                        );
                    }

                    if (eventType === "done") {
                        onComplete?.(
                            parsed.sources
                        );
                    }
                } catch (error) {
                    if (
                        error instanceof Error &&
                        error.message !==
                        "Unexpected end of JSON input"
                    ) {
                        throw error;
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}

export async function getDocumentDetails(
  documentId: string
): Promise<{
  success: boolean;
  document: import("../types/chat").DocumentDetails;
}> {
  const response =
    await fetch(
      `${API_URL}/documents/${documentId}`,
      {
        method: "GET",
        credentials: "include",
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch document"
    );
  }

  return data;
}