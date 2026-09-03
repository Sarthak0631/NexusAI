import { Request, Response } from "express";
import { chunkText } from "../services/chunking.service";

export async function createChunks(
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

    const chunks = chunkText(text);

    return res.status(200).json({
      success: true,
      totalChunks: chunks.length,
      chunks,
    });
  } catch (error) {
    console.error("Chunking error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create text chunks",
    });
  }
}