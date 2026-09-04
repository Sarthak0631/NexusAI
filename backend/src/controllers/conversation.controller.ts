import { Request, Response } from "express";

import {
  createConversation,
  getUserConversations,
  getConversationById,
} from "../services/conversation.service";

import ConversationModel from "../models/Conversation";

/* =========================================================
   Create Conversation
========================================================= */

export async function createConversationController(
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

    const title =
      typeof req.body?.title === "string"
        ? req.body.title
        : "New Conversation";

    const conversation =
      await createConversation(
        userId,
        title
      );

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create conversation",
    });
  }
}

/* =========================================================
   Get All User Conversations
========================================================= */

export async function getConversationsController(
  req: Request,
  res: Response
) {
  try {
    const userId =
      req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      50
    );

    const skip =
      (page - 1) * limit;

    const [
      conversations,
      total,
    ] = await Promise.all([
      ConversationModel.find({
        userId,
      })
        .sort({
          updatedAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      ConversationModel.countDocuments({
        userId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      conversations,
      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch conversations",
    });
  }
}

/* =========================================================
   Get Single Conversation
========================================================= */

export async function getConversationController(
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

    /*
      Convert Express route parameter
      into a guaranteed string.
    */

    const conversationId =
      String(req.params.id);

    const conversation =
      await getConversationById(
        conversationId,
        userId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch conversation",
    });
  }
}