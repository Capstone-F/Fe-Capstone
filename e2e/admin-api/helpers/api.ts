/**
 * Minimal JSON HTTP client for the admin API suite.
 *
 * Deliberately not the app's Axios client: the suite must exercise the raw BE contract
 * on :3001 without the BFF proxy, the auth interceptors, or any FE mapping in the way.
 */

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type QueryValue = string | number | boolean | undefined;

export interface RequestOptions {
  readonly body?: unknown;
  readonly query?: Record<string, QueryValue>;
  /** Token override for a single call; falls back to the client's current token. */
  readonly token?: string | null;
}

export interface ApiResponse<T> {
  readonly status: number;
  readonly body: T;
}

/** Thrown when a call returns a status the caller did not allow. */
export class UnexpectedStatusError extends Error {
  constructor(
    readonly method: HttpMethod,
    readonly path: string,
    readonly status: number,
    readonly expected: readonly number[],
    readonly responseBody: unknown,
  ) {
    super(
      `${method} ${path} -> ${status} (expected ${expected.join("|")})\n` +
        `${JSON.stringify(responseBody, null, 2)}`,
    );
    this.name = "UnexpectedStatusError";
  }
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
): string {
  const url = new URL(
    path.startsWith("/") ? path.slice(1) : path,
    `${baseUrl}/`,
  );
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    // Non-JSON bodies (HTML error pages, redirects) are surfaced verbatim so a dead
    // tunnel or a wrong port is obvious in the failure message.
    return text;
  }
}

export class ApiClient {
  private token: string | null = null;

  constructor(private readonly baseUrl: string) {}

  setToken(token: string | null): void {
    this.token = token;
  }

  /** Sends the request and returns the response without asserting on the status. */
  async raw<T = unknown>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const token = options.token === undefined ? this.token : options.token;
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(buildUrl(this.baseUrl, path, options.query), {
      method,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      redirect: "manual",
    });

    return { status: response.status, body: (await readBody(response)) as T };
  }

  /** Sends the request and throws unless the status is one of `expected`. */
  async request<T = unknown>(
    method: HttpMethod,
    path: string,
    expected: number | readonly number[],
    options: RequestOptions = {},
  ): Promise<T> {
    const allowed = typeof expected === "number" ? [expected] : expected;
    const response = await this.raw<T>(method, path, options);
    if (!allowed.includes(response.status)) {
      throw new UnexpectedStatusError(
        method,
        path,
        response.status,
        allowed,
        response.body,
      );
    }
    return response.body;
  }

  get<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
    return this.request<T>("GET", path, 200, { query });
  }

  post<T>(
    path: string,
    body?: unknown,
    expected: number | readonly number[] = 200,
  ): Promise<T> {
    return this.request<T>("POST", path, expected, { body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    expected: number | readonly number[] = 200,
  ): Promise<T> {
    return this.request<T>("PATCH", path, expected, { body });
  }

  put<T>(
    path: string,
    body?: unknown,
    expected: number | readonly number[] = 200,
  ): Promise<T> {
    return this.request<T>("PUT", path, expected, { body });
  }

  del<T>(path: string, expected: number | readonly number[] = 200): Promise<T> {
    return this.request<T>("DELETE", path, expected);
  }
}

export interface LoginResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: { readonly id: string; readonly email: string | null };
}

export async function login(
  client: ApiClient,
  username: string,
  password: string,
): Promise<LoginResponse> {
  return client.request<LoginResponse>("POST", "/auth/mobile/login", 200, {
    body: { username, password },
    token: null,
  });
}

export async function register(
  client: ApiClient,
  email: string,
  password: string,
  name: string,
): Promise<LoginResponse> {
  return client.request<LoginResponse>("POST", "/auth/mobile/register", 200, {
    body: { email, password, name },
    token: null,
  });
}
