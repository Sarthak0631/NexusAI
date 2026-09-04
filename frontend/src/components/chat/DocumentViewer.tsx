"use client";

import {
  DocumentDetails,
} from "../../types/chat";

interface DocumentViewerProps {
  document: DocumentDetails;
  selectedChunkIndex?: number;
  onClose: () => void;
}

export default function DocumentViewer({
  document,
  selectedChunkIndex,
  onClose,
}: DocumentViewerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6">
      <div className="flex h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}

        <header className="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
              {document.originalName}
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Document Viewer
            </p>
          </div>

          <button
            onClick={onClose}
            className="ml-4 shrink-0 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            ✕
          </button>
        </header>

        {/* Document Information */}

        <div className="shrink-0 border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>
              Type: {document.mimeType}
            </span>

            <span>
              Status: {document.status}
            </span>

            {selectedChunkIndex !==
              undefined && (
              <span className="font-medium text-gray-700">
                Referenced Chunk:{" "}
                {selectedChunkIndex + 1}
              </span>
            )}
          </div>
        </div>

        {/* Document Content */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-5 py-6 sm:px-8 sm:py-8">
            <div className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-800">
              {document.extractedText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}