import { Response } from "express";
import { PDFParse } from "pdf-parse";

import DocumentModel from "../models/Document";
import { AuthRequest } from "../middleware/auth.middleware";

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

const fileName =
  req.file.originalname.toLowerCase();

const isPDF =
  fileName.endsWith(".pdf");

const isTXT =
  fileName.endsWith(".txt");

if (isPDF) {
  // Verify that the actual file is a PDF.
  const pdfSignature =
    req.file.buffer
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
    const pdfData =
      await parser.getText();

    extractedText =
      pdfData.text;
  } finally {
    await parser.destroy();
  }
}

if (isTXT) {
  extractedText =
    req.file.buffer.toString("utf-8");
}

    const document =
      await DocumentModel.create({
        userId: req.userId,

        name: req.file.originalname,

        originalName:
          req.file.originalname,

        mimeType: req.file.mimetype,

        size: req.file.size,

        extractedText,

        status: "ready",
      });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",

      document: {
        id: document._id,
        name: document.name,
        originalName:
          document.originalName,
        mimeType: document.mimeType,
        size: document.size,
        status: document.status,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Document upload error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
    });
  }
}