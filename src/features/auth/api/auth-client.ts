import { apiJson } from "@/lib/api/client";
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

  return apiJson<AuthStatus>("/auth/status");
}

export async function startLogin({
  redirectTo = "/dashboard",
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

export async function logout() {
  if (appConfig.devBypassAuth) {
    return { success: true };
  }

  await apiJson<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
}
