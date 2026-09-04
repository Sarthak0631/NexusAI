"use client";

import { useEffect, useRef } from "react";

import {
    ChatMessage,
    SourceReference,
} from "../../types/chat";

import ChatMessageComponent from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
    messages: ChatMessage[];
    onSend: (
        message: string
    ) => Promise<void>;
    onSourceClick?: (
        source: SourceReference
    ) => void;
    loading: boolean;
    title: string;
}

export default function ChatWindow({
    messages,
    onSend,
    onSourceClick,
    loading,
    title,
}: ChatWindowProps) {
    const messagesEndRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, loading]);

    return (
        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
            {/* =====================================================
          Chat Header
      ===================================================== */}

            <header className="flex shrink-0 items-center border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="min-w-0">
                    <h1 className="truncate text-base font-semibold text-gray-900 sm:text-lg">
                        {title}
                    </h1>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                        NexusAI Multi-Agent Research Assistant
                    </p>
                </div>
            </header>

            {/* =====================================================
          Messages Area
      ===================================================== */}

            <div className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-3 py-5 sm:px-6 sm:py-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center">
                            <div className="w-full max-w-md px-4 text-center">
                                <div className="mb-4 text-4xl">
                                    ✨
                                </div>

                                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                                    Start a conversation
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Ask questions about your
                                    uploaded documents and
                                    NexusAI will research and
                                    analyze them for you.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 sm:gap-5">
                            {messages.map(
                                (message, index) => (
                                    <ChatMessageComponent
                                        key={
                                            message._id ??
                                            `${message.role}-${index}`
                                        }
                                        message={message}
                                        onSourceClick={
                                            onSourceClick
                                        }
                                    />
                                )
                            )}

                            {loading &&
                                messages[
                                    messages.length - 1
                                ]?.role !== "assistant" && (
                                    <div className="flex justify-start">
                                        <div className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    NexusAI is thinking
                                                </span>

                                                <span className="flex gap-1">
                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />

                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />

                                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* =====================================================
          Chat Input
      ===================================================== */}

            <div className="shrink-0">
                <ChatInput
                    onSend={onSend}
                    disabled={loading}
                />
            </div>
        </section>
    );
}