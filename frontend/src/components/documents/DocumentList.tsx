"use client";

import { DocumentItem } from "@/types/document";

interface DocumentListProps {
  documents: DocumentItem[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

export default function DocumentList({
  documents,
  onDelete,
  deletingId,
}: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-2xl">
          ▣
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          No documents yet
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Upload your first document to start
          building your AI knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900">
          Your Documents
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {documents.length}{" "}
          {documents.length === 1
            ? "document"
            : "documents"}
        </p>
      </div>

      <div className="divide-y divide-gray-100">

        {documents.map((document) => (
          <div
            key={document._id}
            className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-gray-50"
          >

            <div className="flex min-w-0 items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold uppercase">
                {document.mimeType ===
                "application/pdf"
                  ? "PDF"
                  : "TXT"}
              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-gray-900">
                  {document.originalName}
                </p>

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                  <span>
                    {formatFileSize(
                      document.size
                    )}
                  </span>

                  <span>•</span>

                  <span>
                    {formatDate(
                      document.createdAt
                    )}
                  </span>
                </div>

              </div>

            </div>

            <div className="flex shrink-0 items-center gap-4">

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  document.status === "ready"
                    ? "bg-gray-100 text-gray-700"
                    : document.status ===
                        "processing"
                      ? "bg-gray-100 text-gray-500"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {document.status}
              </span>

              <button
                onClick={() =>
                  onDelete(document._id)
                }
                disabled={
                  deletingId === document._id
                }
                className="rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === document._id
                  ? "Deleting..."
                  : "Delete"}
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}