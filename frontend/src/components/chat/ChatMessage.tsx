"use client";

import {
    ChatMessage as ChatMessageType,
} from "../../types/chat";

import {
    SourceReference,
} from "../../types/chat";

interface ChatMessageProps {
    message: ChatMessageType;
    onSourceClick?: (
        source: SourceReference
    ) => void;
}

import SourceReferences from "./SourceReferences";

export default function ChatMessage({
    message,
    onSourceClick,
}: ChatMessageProps) {
    const isUser =
        message.role === "user";

    return (
        <div
            className={`flex w-full ${isUser
                ? "justify-end"
                : "justify-start"
                }`}
        >
            <div
                className={`max-w-[90%] break-words rounded-2xl px-4 py-3 sm:max-w-[80%] ${isUser
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-900"
                    }`}
            >
                <div className="mb-1 text-xs font-semibold opacity-60">
                    {isUser
                        ? "You"
                        : "NexusAI"}
                </div>

                <div className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.content}
                </div>

                {!isUser &&
                    message.sources &&
                    message.sources.length > 0 && (
                        <SourceReferences
                            sources={message.sources}
                            onSourceClick={
                                onSourceClick
                            }
                        />
                    )}
            </div>
        </div>
    );
}