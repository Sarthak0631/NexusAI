"use client";

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
}

export default function ConversationSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  loading,
}: ConversationSidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-gray-50 sm:w-72">
      {/* =====================================================
          New Conversation
      ===================================================== */}

      <div className="shrink-0 border-b border-gray-200 p-3 sm:p-4">
        <button
          onClick={onNewConversation}
          className="w-full rounded-lg bg-black px-3 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
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
          <div className="px-2 py-4 text-sm text-gray-500">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-2 py-4 text-sm leading-5 text-gray-500">
            No conversations yet.
          </div>
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
                    onClick={() =>
                      onSelectConversation(
                        conversation._id
                      )
                    }
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      isActive
                        ? "bg-gray-200 text-gray-900"
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
  );
}