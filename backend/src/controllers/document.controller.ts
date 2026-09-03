import { Response } from "express";
import { PDFParse } from "pdf-parse";

import DocumentModel from "../models/Document";
import { AuthRequest } from "../middleware/auth.middleware";
import { ingestDocument } from "../services/ingestion.service";

export async function uploadDocument(
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document uploaded",
      });
    }

    let extractedText = "";

    const fileName = req.file.originalname.toLowerCase();

    const isPDF = fileName.endsWith(".pdf");
    const isTXT = fileName.endsWith(".txt");

    if (isPDF) {
      const pdfSignature = req.file.buffer
        .subarray(0, 5)
        .toString("ascii");

      if (pdfSignature !== "%PDF-") {
        return res.status(400).json({
          success: false,
          message: "Invalid PDF file",
        });
      }

      const parser = new PDFParse({
        data: req.file.buffer,
      });

      try {
        const pdfData = await parser.getText();
        extractedText = pdfData.text;
      } finally {
        await parser.destroy();
      }
    }

    if (isTXT) {
      extractedText = req.file.buffer.toString("utf-8");
    }

    if (!extractedText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Could not extract any text from the document",
      });
    }

    // Save document first
    const document = await DocumentModel.create({
      userId: req.userId,
      name: req.file.originalname,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText,
      status: "processing",
    });

    // Chunk → Embedding → Pinecone
    const ingestionResult = await ingestDocument({
      documentId: document._id.toString(),
      userId: req.userId.toString(),
      text: extractedText,
    });

    // Mark document as ready
    document.status = "ready";
    await document.save();

    return res.status(201).json({
      success: true,
      message: "Document uploaded and indexed successfully",
      document: {
        id: document._id,
        name: document.name,
        originalName: document.originalName,
        mimeType: document.mimeType,
        size: document.size,
        status: document.status,
        createdAt: document.createdAt,
      },
      ingestion: {
        totalChunks: ingestionResult.totalChunks,
        namespace: ingestionResult.namespace,
      },
    });
  } catch (error) {
    console.error("Document ingestion error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process document",
    });
  }
}

export async function getDocuments(
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

    const documents = await DocumentModel.find({
      userId: req.userId,
    })
      .select(
        "-extractedText"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error(
      "Get documents error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
}

export async function deleteDocument(
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

    const { id } = req.params;

    const document =
      await DocumentModel.findOneAndDelete({
        _id: id,
        userId: req.userId,
      });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete document error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
    });
  }
}