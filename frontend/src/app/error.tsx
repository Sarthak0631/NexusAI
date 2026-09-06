"use client";

import {
  useEffect,
} from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "Application error:",
      error
    );
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">
          ⚠️
        </div>

        <h1 className="text-2xl font-semibold text-gray-900">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-gray-600">
          We couldn't load this page.
          Please try again.
        </p>

        <button
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </main>
  );
}