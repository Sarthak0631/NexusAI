"use client";

import {
  SourceReference,
} from "../../types/chat";

interface SourceReferencesProps {
  sources: SourceReference[];
  onSourceClick?: (
    source: SourceReference
  ) => void;
}

export default function SourceReferences({
  sources,
  onSourceClick,
}: SourceReferencesProps) {
  if (!sources.length) {
    return null;
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Sources
      </p>

      <div className="space-y-2">
        {sources.map(
          (source, index) => (
            <button
              key={`${source.documentId}-${source.chunkIndex}-${index}`}
              type="button"
              onClick={() =>
                onSourceClick?.(source)
              }
              className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-gray-800">
                    📄{" "}
                    {source.documentName}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Chunk{" "}
                    {source.chunkIndex + 1}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-600">
                  {(
                    source.score * 100
                  ).toFixed(0)}
                  % relevant
                </span>
              </div>

              <p className="mt-2 line-clamp-3 text-xs leading-5 text-gray-500">
                {source.text}
              </p>

              <p className="mt-2 text-[11px] font-medium text-gray-400">
                Click to view document →
              </p>
            </button>
          )
        )}
      </div>
    </div>
  );
}