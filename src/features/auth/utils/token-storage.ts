const ACCESS_TOKEN_KEY = "glowscan_access_token";
const REFRESH_TOKEN_KEY = "glowscan_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
  },
  setAccessToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  getRefreshToken(): string | undefined {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;
  },
  setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
