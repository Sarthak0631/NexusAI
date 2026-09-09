import { DocumentItem } from "../types/document";

import { apiRequest } from "./api-client";

interface DocumentListResponse {
  success: boolean;
  documents: DocumentItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getDocuments(
  limit: number = 50
): Promise<DocumentListResponse> {
  return apiRequest<DocumentListResponse>(
    `/documents?limit=${limit}`,
    {
      method: "GET",
    }
  );
}
