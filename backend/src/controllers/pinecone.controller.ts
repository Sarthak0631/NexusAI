import { Request, Response } from "express";
import {
  getPineconeIndex,
  listPineconeIndexes,
} from "../services/pinecone.service";

export async function testPinecone(
  req: Request,
  res: Response
) {
  try {
    const indexes = await listPineconeIndexes();

    const index = getPineconeIndex();

    const stats = await index.describeIndexStats();

    return res.status(200).json({
      success: true,
      message: "Pinecone connected successfully",
      indexes: indexes.indexes,
      stats,
    });
  } catch (error) {
    console.error("Pinecone error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to connect to Pinecone",
    });
  }
}