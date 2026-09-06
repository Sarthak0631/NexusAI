import Link from "next/link";

const features = [
  {
    icon: "✦",
    title: "Grounded answers",
    description:
      "Ask questions in plain language and get responses drawn from your own documents, not guesswork.",
  },
  {
    icon: "▣",
    title: "Document ingestion",
    description:
      "Upload PDFs and text, then have them chunked, embedded and indexed for retrieval automatically.",
  },
  {
    icon: "◎",
    title: "Multi-agent research",
    description:
      "A router dispatches harder questions to specialist agents that plan, retrieve and synthesise.",
  },
  {
    icon: "❝",
    title: "Traceable sources",
    description:
      "Every answer cites the passages behind it, so you can verify a claim before you rely on it.",
  },
  {
    icon: "◷",
    title: "Persistent history",
    description:
      "Conversations are saved and searchable, letting you pick a thread back up exactly where it ended.",
  },
  {
    icon: "▥",
    title: "Usage analytics",
    description:
      "Track token spend and retrieval quality per conversation to see what your workspace actually costs.",
  },
];

const steps = [
  {
    number: "01",
    title: "Upload your sources",
    description:
      "Add the papers, reports and notes you want the assistant to reason over.",
  },
  {
    number: "02",
    title: "Ask a question",
    description:
      "Retrieval finds the passages that matter and hands them to the model as context.",
  },
  {
    number: "03",
    title: "Read the citations",
    description:
      "Follow each reference back to the original text to confirm the answer holds up.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-lg font-bold text-white">
              N
            </div>

            <span className="text-lg font-bold tracking-tight text-gray-900">
              NexusAI
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Log in
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-gray-200">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,#eef2ff_0%,transparent_70%)]"
          />

          <div className="relative mx-auto w-full max-w-4xl px-6 py-24 text-center sm:py-32">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              Retrieval-augmented research assistant
            </span>

            <h1 className="animate-fade-up mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Answers you can trace
              <br className="hidden sm:block" />{" "}
              back to the source
            </h1>

            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              NexusAI turns your documents into a searchable knowledge
              base. Ask a question, get an answer grounded in your own
              material, and follow every claim back to the passage it
              came from.
            </p>

            <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
              >
                Create an account
              </Link>

              <Link
                href="/login"
                className="w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Built for real research
            </h2>

            <p className="mt-4 text-base leading-7 text-gray-600">
              Retrieval, agents and citations working together, so the
              assistant stays accountable to your sources.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 transition hover:border-gray-300 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-lg text-indigo-600">
                  {feature.icon}
                </div>

                <h3 className="mt-4 text-base font-semibold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-gray-200 bg-gray-50">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:py-24">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              How it works
            </h2>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number}>
                  <div className="text-sm font-semibold text-indigo-600">
                    {step.number}
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-gray-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="mx-auto w-full max-w-4xl px-6 py-20 text-center sm:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Start building your knowledge base
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-gray-600">
            Upload your first document and ask a question in under a
            minute.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Get started free
          </Link>
        </section>
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-xs font-bold text-white">
              N
            </div>

            <span className="text-sm font-medium text-gray-900">
              NexusAI
            </span>
          </div>

          <p className="text-sm text-gray-500">
            Intelligent research and knowledge platform
          </p>
        </div>
      </footer>
    </div>
  );
}
