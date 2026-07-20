import { appConfig } from "@/lib/env";

type ApiJsonInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | object;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function parseError(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function apiFetch(path: string, init: ApiJsonInit = {}) {
  const headers = new Headers(init.headers);
  let body = init.body;

  if (body) {
    if (
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams) &&
      !(body instanceof Blob)
    ) {
      headers.set("content-type", "application/json");
      body = JSON.stringify(body);
    } else if (typeof body === "string") {
      const trimmed = body.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        headers.set("content-type", "application/json");
      }
    }
  }

  const response = await fetch(`${appConfig.apiPrefix}${path}`, {
    ...init,
    headers,
    body,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(
      `Request failed for ${path}`,
      response.status,
      await parseError(response),
    );
  }

  return response;
}

export async function apiJson<T>(path: string, init?: ApiJsonInit) {
  const response = await apiFetch(path, init);

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}
