"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { DocumentItem } from "../../types/document";

interface DocumentSelectorProps {
  documents: DocumentItem[];
  selectedDocumentIds: string[];
  onChange: (
    documentIds: string[]
  ) => void;
  loading?: boolean;
  disabled?: boolean;
}

/*
  Lets the user scope a question to one or
  more uploaded documents.

  An empty selection means "search every
  document in the knowledge base", which is
  the original behaviour.
*/

export default function DocumentSelector({
  documents,
  selectedDocumentIds,
  onChange,
  loading = false,
  disabled = false,
}: DocumentSelectorProps) {
  const [open, setOpen] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  /* Close the dropdown on outside click. */

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handlePointerDown
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handlePointerDown
      );
  }, [open]);

  const readyDocuments =
    documents.filter(
      (document) =>
        document.status === "ready"
    );

  const selectedDocuments =
    readyDocuments.filter((document) =>
      selectedDocumentIds.includes(
        document._id
      )
    );

  function toggleDocument(
    documentId: string
  ) {
    onChange(
      selectedDocumentIds.includes(
        documentId
      )
        ? selectedDocumentIds.filter(
          (id) => id !== documentId
        )
        : [
          ...selectedDocumentIds,
          documentId,
        ]
    );
  }

  const label = loading
    ? "Loading documents..."
    : selectedDocuments.length === 0
      ? "All documents"
      : selectedDocuments.length === 1
        ? selectedDocuments[0]
          .originalName
        : `${selectedDocuments.length} documents`;

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current
          )
        }
        disabled={
          disabled || loading
        }
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex max-w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="text-gray-400">
          ▣
        </span>

        <span className="truncate">
          {label}
        </span>

        <span className="text-gray-400">
          ▾
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute bottom-full z-20 mb-2 max-h-72 w-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="option"
            aria-selected={
              selectedDocumentIds.length ===
              0
            }
            onClick={() => {
              onChange([]);
              setOpen(false);
            }}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${selectedDocumentIds.length ===
              0
              ? "font-semibold text-indigo-600"
              : "text-gray-700"
              }`}
          >
            All documents
          </button>

          {readyDocuments.length ===
            0 ? (
            <p className="px-3 py-3 text-xs text-gray-500">
              No indexed documents yet.
              Upload one from the
              Documents page.
            </p>
          ) : (
            <div className="mt-1 border-t border-gray-100 pt-1">
              {readyDocuments.map(
                (document) => {
                  const selected =
                    selectedDocumentIds.includes(
                      document._id
                    );

                  return (
                    <button
                      key={
                        document._id
                      }
                      type="button"
                      role="option"
                      aria-selected={
                        selected
                      }
                      onClick={() =>
                        toggleDocument(
                          document._id
                        )
                      }
                      className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-gray-50"
                    >
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${selected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-gray-300 text-transparent"
                          }`}
                      >
                        ✓
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-gray-800">
                          {
                            document.originalName
                          }
                        </span>
                      </span>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
