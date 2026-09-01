"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentDocuments from "@/components/dashboard/RecentDocuments";
import RecentConversations from "@/components/dashboard/RecentConversations";

export default function DashboardPage() {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading NexusAI...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Redirecting to login...
        </p>
      </main>
    );
  }

  return (
    <DashboardLayout>

      <div className="p-8">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Workspace Overview
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Good evening, {user.name.split(" ")[0]} 👋
          </h1>

          <p className="mt-2 text-gray-500">
            Here's what's happening with your NexusAI workspace.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Documents"
            value="0"
            description="Knowledge sources"
            icon="▣"
          />

          <StatCard
            title="Conversations"
            value="0"
            description="AI conversations"
            icon="✦"
          />

          <StatCard
            title="Research Sessions"
            value="0"
            description="Research projects"
            icon="◎"
          />

          <StatCard
            title="AI Usage"
            value="0"
            description="Tokens this month"
            icon="◈"
          />

        </div>

        {/* Quick Actions */}
        <div className="mb-8">

          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="grid gap-4 md:grid-cols-3">

            <button
              onClick={() => router.push("/chat")}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-400 hover:shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                ✦
              </div>

              <h3 className="font-semibold text-gray-900">
                Ask AI
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Ask questions and research with AI.
              </p>
            </button>

            <button
              onClick={() => router.push("/documents")}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-400 hover:shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                ↑
              </div>

              <h3 className="font-semibold text-gray-900">
                Upload Document
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add documents to your knowledge base.
              </p>
            </button>

            <button
              onClick={() => router.push("/research")}
              className="rounded-xl border border-gray-200 bg-white p-5 text-left transition hover:border-gray-400 hover:shadow-sm"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                ◎
              </div>

              <h3 className="font-semibold text-gray-900">
                Start Research
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Start an intelligent research workflow.
              </p>
            </button>

          </div>

        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 xl:grid-cols-2">

          <RecentDocuments />

          <RecentConversations />

        </div>

      </div>

    </DashboardLayout>
  );
}