import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { API_ENDPOINTS } from "@/config/api-endpoints";

import type { AuthStatus, SessionUser } from "../types/auth";

import { ApiError } from "@/lib/api/client";

export async function getSession(): Promise<SessionUser | null> {
  if (appConfig.devBypassAuth) {
    return {
      id: "dev-user-id",
      email: "dev@glowscan.local",
      name: "Dev User",
      provider: "local",
      roles: ["CUSTOMER"],
      clinicId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  if (
    typeof window !== "undefined" &&
    !localStorage.getItem("glowscan_access_token")
  ) {
    return null;
  }

  try {
    return await apiJson<SessionUser>(API_ENDPOINTS.USERS.ME);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("glowscan_access_token");
        localStorage.removeItem("glowscan_refresh_token");
      }
      return null;
    }
    return null;
  }
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

  return { authenticated: false } satisfies AuthStatus;
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
  const response = await apiJson<MobileTokenResponse>(
    API_ENDPOINTS.AUTH.MOBILE_LOGIN,
    {
      method: "POST",
      body: { username, password },
    },
  );

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
  const response = await apiJson<MobileTokenResponse>(
    API_ENDPOINTS.AUTH.MOBILE_REGISTER,
    {
      method: "POST",
      body: { email, password, name },
    },
  );

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

  return { success: true };
}
