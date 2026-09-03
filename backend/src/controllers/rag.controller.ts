import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { generateRAGResponse } from "../services/rag.service";

export async function askDocumentQuestion(
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

    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const result = await generateRAGResponse(
      question.trim(),
      req.userId.toString()
    );

    return res.status(200).json({
      success: true,
      question: question.trim(),
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    console.error("RAG error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate RAG response",
    });
  }
}