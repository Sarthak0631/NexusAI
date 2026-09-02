"use client";

import { ChangeEvent, useRef, useState } from "react";

interface UploadDocumentProps {
  onUploadSuccess: () => void;
}

export default function UploadDocument({
  onUploadSuccess,
}: UploadDocumentProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
    ];

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase();

    const isAllowed =
      allowedTypes.includes(
        file.type
      ) ||
      extension === "pdf" ||
      extension === "txt";

    if (!isAllowed) {
      setError(
        "Only PDF and TXT files are supported."
      );

      setSelectedFile(null);

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "File size must be less than 10 MB."
      );

      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError(
        "Please select a document first."
      );

      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "document",
        selectedFile
      );

      const response = await fetch(
        "http://localhost:5000/api/documents/upload",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Upload failed"
        );
      }

      setSuccess(
        "Document uploaded successfully."
      );

      setSelectedFile(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      onUploadSuccess();

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">

      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Upload Document
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Add a PDF or TXT file to your
          NexusAI knowledge base.
        </p>
      </div>

      <div
        onClick={() =>
          inputRef.current?.click()
        }
        className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center transition hover:border-gray-400 hover:bg-white"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
          ↑
        </div>

        <p className="font-medium text-gray-900">
          Click to select a document
        </p>

        <p className="mt-2 text-sm text-gray-500">
          PDF or TXT • Maximum 10 MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {selectedFile.name}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {(
                selectedFile.size /
                1024
              ).toFixed(1)}{" "}
              KB
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedFile(null);

              if (inputRef.current) {
                inputRef.current.value =
                  "";
              }
            }}
            className="ml-4 text-sm text-gray-400 hover:text-gray-900"
          >
            Remove
          </button>

        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
          {success}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={
          !selectedFile || uploading
        }
        className="mt-5 w-full rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {uploading
          ? "Uploading..."
          : "Upload Document"}
      </button>

    </div>
  );
}