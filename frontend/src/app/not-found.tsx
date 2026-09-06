export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="text-center">
        <p className="text-6xl font-bold">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold">
          Page not found
        </h1>

        <p className="mt-2 text-gray-500">
          The page you're looking for
          doesn't exist.
        </p>

        <a
          href="/chat"
          className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
        >
          Go to Chat
        </a>
      </div>
    </main>
  );
}