import { API_URL } from "./api.config";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    body,
    headers,
    ...rest
  } = options;

  const requestHeaders = new Headers(
    headers
  );

  if (body !== undefined) {
    requestHeaders.set(
      "Content-Type",
      "application/json"
    );
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...rest,

        headers: requestHeaders,

        credentials: "include",

        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );
  } catch (error) {
    console.error(
      "API network error:",
      error
    );

    throw new Error(
      "Unable to connect to the server. Please check your connection and try again."
    );
  }

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (
        data as {
          message?: unknown;
        }
      ).message === "string"
    ) {
      message = (
        data as {
          message: string;
        }
      ).message;
    }

    throw new Error(message);
  }

  return data as T;
}