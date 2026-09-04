import mongoose from "mongoose";
import ConversationModel from "../models/Conversation";

export async function createConversation(
  userId: string,
  title: string = "New Conversation"
) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const conversation =
    await ConversationModel.create({
      userId,
      title: title.trim() || "New Conversation",
      messages: [],
    });

  return conversation;
}

export async function getUserConversations(
  userId: string
) {
  return await ConversationModel.find({
    userId,
  })
    .select("_id title createdAt updatedAt")
    .sort({
      updatedAt: -1,
    })
    .lean();
}

export async function getConversationById(
  conversationId: string,
  userId: string
) {
  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId
    )
  ) {
    throw new Error(
      "Invalid conversation ID"
    );
  }

  return await ConversationModel.findOne({
    _id: conversationId,
    userId,
  })
  .lean();
}

export async function addMessageToConversation(
  conversationId: string,
  userId: string,
  role: "user" | "assistant",
  content: string,
  sources?: {
    documentId: string;
    documentName: string;
    chunkIndex: number;
    score: number;
    text: string;
  }[]
) {
  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId
    )
  ) {
    throw new Error(
      "Invalid conversation ID"
    );
  }

  const conversation =
  await ConversationModel.findOne({
    _id: conversationId,
    userId,
  });

  if (!conversation) {
    throw new Error(
      "Conversation not found"
    );
  }

  conversation.messages.push({
    role,
    content,
    ...(sources &&
    sources.length > 0
      ? { sources }
      : {}),
    createdAt: new Date(),
  });

  await conversation.save();

  return conversation;
}