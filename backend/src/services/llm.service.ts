import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is missing from backend/.env");
}

const llm = new ChatGroq({
  model: "openai/gpt-oss-20b",
  temperature: 0.7,
  apiKey,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateAIResponse(
  messages: ChatMessage[]
) {
  const langChainMessages = messages.map((message) => {
    switch (message.role) {
      case "system":
        return new SystemMessage(message.content);

      case "user":
        return new HumanMessage(message.content);

      case "assistant":
        return new AIMessage(message.content);
    }
  });

  const response = await llm.invoke(langChainMessages);

  return {
    content:
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content),

    usage: response.usage_metadata,
  };
}

export async function streamAIResponse(
  messages: ChatMessage[]
) {
  const langChainMessages =
    messages.map((message) => {
      switch (message.role) {
        case "system":
          return new SystemMessage(
            message.content
          );

        case "user":
          return new HumanMessage(
            message.content
          );

        case "assistant":
          return new AIMessage(
            message.content
          );
      }
    });

  return await llm.stream(
    langChainMessages
  );
}