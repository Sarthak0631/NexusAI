"use client";

import { useEffect, useState } from "react";
import { checkBackendHealth } from "@/services/api";

interface HealthResponse {
  success: boolean;
  status: string;
  service: string;
}

export default function TestApiPage() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchHealth() {
      try {
        const result = await checkBackendHealth();
        setData(result);
      } catch (error) {
        console.error(error);
        setError("Unable to connect to NexusAI backend");
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          NexusAI API Test
        </h1>

        {loading && (
          <p className="text-gray-600">
            Connecting to backend...
          </p>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Backend Status
              </p>

              <p className="font-semibold text-green-600">
                {data.status}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Service
              </p>

              <p className="font-semibold text-gray-900">
                {data.service}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="font-semibold text-green-700">
                ✓ Backend connected successfully!
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}