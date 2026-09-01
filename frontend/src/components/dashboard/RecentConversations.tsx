const conversations = [
  {
    title: "Understanding RAG Systems",
    time: "30 minutes ago",
  },
  {
    title: "Research on Multi-Agent Architecture",
    time: "Yesterday",
  },
  {
    title: "LangGraph vs LangChain",
    time: "2 days ago",
  },
];

export default function RecentConversations() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">

      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

        <div>
          <h2 className="font-semibold text-gray-900">
            Recent Conversations
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Continue your AI research
          </p>
        </div>

        <button className="text-sm font-medium text-gray-600 hover:text-black">
          View all
        </button>

      </div>

      <div className="divide-y divide-gray-100">

        {conversations.map((conversation) => (
          <div
            key={conversation.title}
            className="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                ✦
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {conversation.title}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {conversation.time}
                </p>
              </div>

            </div>

            <span className="text-gray-400">
              →
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}