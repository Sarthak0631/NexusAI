"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [
    authLoading,
    user,
    router,
  ]);

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

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const message =
      input.trim();

    if (!message || loading) {
      return;
    }

    setError("");

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "http://localhost:5000/api/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials: "include",

            body: JSON.stringify({
              message,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to get AI response"
        );
      }

      const assistantMessage:
        ChatMessage = {
        role: "assistant",
        content: data.message,
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>

      <div className="flex h-[calc(100vh-4rem)] flex-col">

        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-5">

          <p className="text-sm font-medium text-gray-500">
            AI Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            AI Assistant
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Ask NexusAI anything about your
            research.
          </p>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 py-8">

          {messages.length === 0 ? (
            <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl text-white">
                ✦
              </div>

              <h2 className="text-2xl font-bold text-gray-900">
                How can I help you?
              </h2>

              <p className="mt-3 max-w-lg text-gray-500">
                Ask questions, explore ideas,
                summarize information, or
                get help with your research.
              </p>

            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">

              {messages.map(
                (message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role ===
                      "user"
                      ? "justify-end"
                      : "justify-start"
                      }`}
                  >

                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-4 ${message.role ===
                        "user"
                        ? "bg-black text-white"
                        : "border border-gray-200 bg-white text-gray-900"
                        }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-7">
                        {message.content}
                      </p>
                    </div>

                  </div>
                )
              )}

              {loading && (
                <div className="flex justify-start">

                  <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4">

                    <div className="flex gap-1">
                      <span className="animate-bounce">
                        •
                      </span>

                      <span className="animate-bounce [animation-delay:100ms]">
                        •
                      </span>

                      <span className="animate-bounce [animation-delay:200ms]">
                        •
                      </span>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Error */}
        {error && (
          <div className="px-8 pb-3">

            <div className="mx-auto max-w-3xl rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
              {error}
            </div>

          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 bg-white px-8 py-5">

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl gap-3"
          >

            <input
              value={input}
              onChange={(event) =>
                setInput(
                  event.target.value
                )
              }
              placeholder="Ask NexusAI..."
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm outline-none transition focus:border-gray-400 focus:bg-white disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={
                !input.trim() ||
                loading
              }
              className="rounded-xl bg-black px-6 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Thinking..."
                : "Send"}
            </button>

          </form>

        </div>

      </div>

    </DashboardLayout>
  );
}