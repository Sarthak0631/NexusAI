import { Request, Response } from "express";
import { generateEmbedding } from "../services/embedding.service";

export async function createEmbedding(
  req: Request,
  res: Response
) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const embedding = await generateEmbedding(text);

    return res.status(200).json({
      success: true,
      dimensions: embedding.length,
      embedding,
    });
  } catch (error) {
    console.error("Embedding error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate embedding",
    });
  }
}