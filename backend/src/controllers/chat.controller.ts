import { Response } from "express";

import {
  generateAIResponse,
  ChatMessage,
} from "../services/llm.service";

import { AuthRequest } from "../middleware/auth.middleware";

export async function chatWithAI(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const messages: ChatMessage[] = [
      {
        role: "system",
        content:
          "You are NexusAI, an intelligent research assistant. Give clear, accurate and helpful answers.",
      },

      {
        role: "user",
        content: message.trim(),
      },
    ];

    const result =
      await generateAIResponse(
        messages
      );

    return res.status(200).json({
      success: true,

      message:
        result.content,

      usage: result.usage,
    });

  } catch (error) {
    console.error(
      "AI chat error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate AI response",
    });
  }
}