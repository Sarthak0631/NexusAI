import mongoose, { Document, Schema } from "mongoose";

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText: string;
  status: "processing" | "ready" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    extractedText: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "processing",
        "ready",
        "failed",
      ],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

const DocumentModel =
  mongoose.model<IDocument>(
    "Document",
    documentSchema
  );

export default DocumentModel;