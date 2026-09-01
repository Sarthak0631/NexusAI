const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RequestOptions {
  method?: string;
  body?: unknown;
}

async function apiRequest(
  endpoint: string,
  options: RequestOptions = {}
) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}

export async function checkBackendHealth() {
  return apiRequest("/api/health");
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    body: data,
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}) {
  return apiRequest("/api/auth/login", {
    method: "POST",
    body: data,
  });
}

export async function logoutUser() {
  return apiRequest("/api/auth/logout", {
    method: "POST",
  });
}

export async function getCurrentUser() {
  return apiRequest("/api/auth/me");
}