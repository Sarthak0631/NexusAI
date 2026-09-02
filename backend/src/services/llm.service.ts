import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is missing from backend/.env");
}

const groq = new Groq({
  apiKey,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function generateAIResponse(messages: ChatMessage[]) {
  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages,
    temperature: 0.7,
  });

  return {
    content: response.choices[0]?.message?.content ?? "",
    usage: response.usage,
  };
}