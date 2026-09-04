import { Request, Response } from "express";

import { runMultiAgent } from "../services/multi-agent.service";

import {
  getConversationById,
  addMessageToConversation,
} from "../services/conversation.service";

export async function askMultiAgent(
  req: Request,
  res: Response
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const question =
      typeof req.body?.question === "string"
        ? req.body.question.trim()
        : "";

    const conversationId =
      typeof req.body?.conversationId === "string"
        ? req.body.conversationId.trim()
        : "";

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    /*
      Load conversation belonging to
      the authenticated user.
    */

    const conversation =
      await getConversationById(
        conversationId,
        userId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    /*
      Convert previous messages into
      a compact text format for the agents.
    */

    const history =
      conversation.messages
        .slice(-10)
        .map(
          (message) =>
            `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`
        )
        .join("\n\n");

    /*
      Save the current user message
      before running the AI workflow.
    */

    await addMessageToConversation(
      conversationId,
      userId,
      "user",
      question
    );

    /*
      Run the multi-agent workflow
      with conversation history.
    */

    const result =
      await runMultiAgent(
        question,
        userId,
        history
      );

    /*
      Save AI response.
    */

    await addMessageToConversation(
      conversationId,
      userId,
      "assistant",
      result.answer
    );

    return res.status(200).json({
      success: true,

      question,

      conversationId,

      answer: result.answer,

      research: result.research,

      analysis: result.analysis,

      supervisorDecision:
        result.supervisorDecision,

      usage: result.usage,

      cost: result.cost,
    });
  } catch (error) {
    console.error(
      "Multi-agent controller error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process multi-agent request",
    });
  }
}