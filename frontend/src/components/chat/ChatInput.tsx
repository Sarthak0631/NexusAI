"use client";

import {
  FormEvent,
  useState,
} from "react";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      disabled
    ) {
      return;
    }

    setMessage("");

    await onSend(trimmedMessage);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();

                const form =
                  event.currentTarget.form;

                form?.requestSubmit();
              }
            }}
            placeholder="Ask anything about your documents..."
            disabled={disabled}
            rows={1}
            className="min-h-[48px] max-h-32 flex-1 resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-300 disabled:cursor-not-allowed disabled:bg-gray-100"
          />

          <button
            type="submit"
            disabled={
              disabled ||
              !message.trim()
            }
            className="shrink-0 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
          >
            {disabled
              ? "Thinking..."
              : "Send"}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          <span className="hidden sm:inline">
            Press Enter to send · Shift + Enter
            for a new line
          </span>

          <span className="sm:hidden">
            Enter to send · Shift + Enter for
            new line
          </span>
        </p>
      </div>
    </form>
  );
}