"use client";

import Link from "next/link";

import {
  Conversation,
} from "../../types/chat";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (
    conversationId: string
  ) => void;
  onNewConversation: () => void;
  loading: boolean;
  open?: boolean;
  onClose?: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  loading,
  open = false,
  onClose,
}: ConversationSidebarProps) {
  return (
    <>
      {/* Backdrop, mobile only */}
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-72 shrink-0 flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-200 lg:static lg:z-auto lg:h-full lg:w-72 lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* =====================================================
            Header
        ===================================================== */}

        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-3 sm:px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <span>←</span>
            Dashboard
          </Link>

          <button
            onClick={onClose}
            aria-label="Close conversations"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* =====================================================
            New Conversation
        ===================================================== */}

        <div className="shrink-0 border-b border-gray-200 p-3 sm:p-4">
          <button
            onClick={onNewConversation}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            + New Conversation
          </button>
        </div>

        {/* =====================================================
            Conversation List
        ===================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
          <p className="mb-2 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:mb-3">
            Conversations
          </p>

          {loading ? (
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-10 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="px-2 py-4 text-sm text-gray-500">
              No conversations yet. Start a new one above.
            </p>
          ) : (
            <div className="space-y-1">
              {conversations.map(
                (conversation) => {
                  const isActive =
                    conversation._id ===
                    activeConversationId;

                  return (
                    <button
                      key={conversation._id}
                      onClick={() => {
                        onSelectConversation(
                          conversation._id
                        );

                        onClose?.();
                      }}
                      className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <div className="truncate font-medium">
                        {conversation.title}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(
                          conversation.updatedAt
                        ).toLocaleDateString()}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
