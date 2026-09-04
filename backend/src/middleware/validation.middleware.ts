import {
  Request,
  Response,
  NextFunction,
} from "express";

import mongoose from "mongoose";

export function validateQuestion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    question,
  } = req.body;

  if (
    typeof question !==
    "string"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Question must be a string.",
    });
  }

  const trimmedQuestion =
    question.trim();

  if (
    trimmedQuestion.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Question cannot be empty.",
    });
  }

  if (
    trimmedQuestion.length > 5000
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Question cannot exceed 5000 characters.",
    });
  }

  req.body.question =
    trimmedQuestion;

  next();
}

export function validateConversationId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    conversationId,
  } = req.body;

  if (
    typeof conversationId !==
    "string"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "conversationId must be a string.",
    });
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      conversationId
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid conversationId.",
    });
  }

  next();
}