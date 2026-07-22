import axios from "axios";
import { ENV } from "@/core/config/env";
import { getApiAuthHandlers } from "./auth-handlers";
import { ApiError, normalizeApiError } from "./errors";
import { refreshState } from "./refresh-state";

export const publicApiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.API_TIMEOUT,
});

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: ENV.API_TIMEOUT,
});

export const externalApiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  if (config.skipAuth) {
    return config;
  }

  const accessToken = getApiAuthHandlers()?.getAccessToken();
  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(normalizeApiError(error));
    }

    const originalRequest = error.config;
    const authHandlers = getApiAuthHandlers();

    const canRefresh =
      error.response?.status === 401 &&
      originalRequest !== undefined &&
      originalRequest._retry !== true &&
      originalRequest.skipAuthRefresh !== true &&
      authHandlers !== null;

    if (!canRefresh) {
      return Promise.reject(normalizeApiError(error));
    }

    originalRequest._retry = true;

    try {
      const accessToken = await refreshState.run(
        authHandlers.refreshAccessToken,
      );
      originalRequest.headers.set("Authorization", `Bearer ${accessToken}`);
      return apiClient(originalRequest);
    } catch (refreshError: unknown) {
      authHandlers.onSessionExpired();

      if (refreshError instanceof ApiError) {
        return Promise.reject(refreshError);
      }

      return Promise.reject(normalizeApiError(refreshError));
    }
  },
);
