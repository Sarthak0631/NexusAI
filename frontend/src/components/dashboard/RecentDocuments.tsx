const documents = [
  {
    name: "AI Architecture Research.pdf",
    type: "PDF",
    time: "2 hours ago",
  },
  {
    name: "RAG System Documentation.pdf",
    type: "PDF",
    time: "Yesterday",
  },
  {
    name: "Project Notes.txt",
    type: "TXT",
    time: "2 days ago",
  },
];

export default function RecentDocuments() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white">

      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

        <div>
          <h2 className="font-semibold text-gray-900">
            Recent Documents
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your recently added knowledge
          </p>
        </div>

        <button className="text-sm font-medium text-gray-600 hover:text-black">
          View all
        </button>

      </div>

      <div className="divide-y divide-gray-100">

        {documents.map((document) => (
          <div
            key={document.name}
            className="flex items-center justify-between px-6 py-4 transition hover:bg-gray-50"
          >

            <div className="flex items-center gap-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold">
                {document.type}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900">
                  {document.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {document.time}
                </p>
              </div>

            </div>

            <button className="text-gray-400 hover:text-gray-900">
              ⋮
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}