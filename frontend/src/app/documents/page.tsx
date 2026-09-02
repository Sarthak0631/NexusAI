"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadDocument from "@/components/documents/UploadDocument";
import DocumentList from "@/components/documents/DocumentList";

import { useAuth } from "@/context/AuthContext";
import { DocumentItem } from "@/types/document";

export default function DocumentsPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [
    authLoading,
    user,
    router,
  ]);

  async function fetchDocuments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/documents",
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch documents"
        );
      }

      setDocuments(
        data.documents || []
      );

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load documents."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/documents/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete document"
        );
      }

      setDocuments((current) =>
        current.filter(
          (document) =>
            document._id !== id
        )
      );

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Loading NexusAI...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <DashboardLayout>

      <div className="p-8">

        {/* Header */}
        <div className="mb-8">

          <p className="text-sm font-medium text-gray-500">
            Knowledge Base
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Documents
          </h1>

          <p className="mt-2 text-gray-500">
            Upload and manage the documents
            NexusAI will use for intelligent
            answers.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-700">
            {error}
          </div>
        )}

        {/* Upload */}
        <div className="mb-8 max-w-3xl">
          <UploadDocument
            onUploadSuccess={
              fetchDocuments
            }
          />
        </div>

        {/* Documents */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              Loading documents...
            </p>
          </div>
        ) : (
          <DocumentList
            documents={documents}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}

      </div>

    </DashboardLayout>
  );
}