import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { retrieveRelevantChunks } from "../services/retrieval.service";

export async function retrieveDocuments(
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

    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const chunks = await retrieveRelevantChunks(
      query.trim(),
      req.userId.toString(),
      5
    );

    return res.status(200).json({
      success: true,
      query: query.trim(),
      results: chunks,
    });
  } catch (error) {
    console.error("Retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve relevant documents",
    });
  }
}