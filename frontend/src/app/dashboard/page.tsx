"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    loading,
    logout,
  } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // While checking authentication
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mb-3 text-lg font-semibold">
            Loading NexusAI...
          </div>

          <p className="text-sm text-gray-500">
            Checking your authentication
          </p>
        </div>
      </main>
    );
  }

  // If user is not authenticated,
  // useEffect will redirect to login.
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NexusAI Dashboard
            </h1>

            <p className="mt-2 text-gray-500">
              Welcome, {user.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800"
          >
            Logout
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Documents */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="font-semibold text-gray-900">
              Documents
            </h2>

            <p className="mt-2 text-gray-500">
              0 documents
            </p>
          </div>

          {/* Conversations */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="font-semibold text-gray-900">
              Conversations
            </h2>

            <p className="mt-2 text-gray-500">
              0 conversations
            </p>
          </div>

          {/* AI Usage */}
          <div className="rounded-xl bg-white p-6 shadow">
            <h2 className="font-semibold text-gray-900">
              AI Usage
            </h2>

            <p className="mt-2 text-gray-500">
              No usage yet
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}