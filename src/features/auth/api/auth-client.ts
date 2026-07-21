import { apiJson, ApiError } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { sanitizeRedirectPath } from "@/shared/utils/safe-redirect";

import { DEV_BYPASS_SESSION_USER } from "../constants/session-dev";
import type { AuthStatus, SessionUser, StartLoginInput } from "../types/auth";

export async function getSession() {
  if (appConfig.devBypassAuth) {
    return DEV_BYPASS_SESSION_USER;
  }

  return apiJson<SessionUser>("/users/me");
}

export async function getAuthStatus() {
  if (appConfig.devBypassAuth) {
    return { authenticated: true } satisfies AuthStatus;
  }

  if (
    typeof window !== "undefined" &&
    localStorage.getItem("glowscan_access_token")
  ) {
    return { authenticated: true } satisfies AuthStatus;
  }

  return apiJson<AuthStatus>("/auth/status");
}

export async function startLogin({
  redirectTo = "/",
  idpHint,
}: StartLoginInput = {}) {
  if (appConfig.devBypassAuth) {
    window.location.assign(sanitizeRedirectPath(redirectTo));
    return;
  }

  const clientRedirectUri = new URL(
    sanitizeRedirectPath(redirectTo),
    window.location.origin,
  ).toString();

  const response = await apiJson<{ login_uri: string }>("/auth/login", {
    method: "POST",
    body: {
      client_redirect_uri: clientRedirectUri,
      ...(idpHint ? { idpHint } : {}),
    },
  });

  window.location.assign(response.login_uri);
}

interface MobileTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: unknown;
}

export async function loginDirect(
  username: string,
  password: string,
): Promise<MobileTokenResponse> {
  const response = await apiJson<MobileTokenResponse>("/auth/mobile/login", {
    method: "POST",
    body: { username, password },
  });

  if (typeof window !== "undefined" && response.accessToken) {
    localStorage.setItem("glowscan_access_token", response.accessToken);
    localStorage.setItem("glowscan_refresh_token", response.refreshToken);
  }

  return response;
}

export async function registerDirect(
  email: string,
  password: string,
  name: string,
): Promise<MobileTokenResponse> {
  const response = await apiJson<MobileTokenResponse>("/auth/mobile/register", {
    method: "POST",
    body: { email, password, name },
  });

  if (typeof window !== "undefined" && response.accessToken) {
    localStorage.setItem("glowscan_access_token", response.accessToken);
    localStorage.setItem("glowscan_refresh_token", response.refreshToken);
  }

  return response;
}

export async function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("glowscan_access_token");
    localStorage.removeItem("glowscan_refresh_token");
  }

  if (appConfig.devBypassAuth) {
    return { success: true };
  }

  try {
    return await apiJson<{ success: boolean }>("/auth/logout", {
      method: "POST",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { success: true };
    }
    console.warn("Logout request failed or session already cleared:", error);
    return { success: true };
  }
}
