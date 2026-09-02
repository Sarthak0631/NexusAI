export interface DocumentItem {
  _id: string;
  userId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: "processing" | "ready" | "failed";
  createdAt: string;
  updatedAt: string;
}