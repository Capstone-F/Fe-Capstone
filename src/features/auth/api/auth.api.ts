import { apiClient, publicApiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { tokenStorage } from "../utils/token-storage";
import type {
  SessionUser,
  AuthStatus,
  MobileTokenResponse,
  RefreshTokenRequestDto,
  RefreshTokenResponse,
} from "../types/auth.types";
import type { AxiosResponse } from "axios";

export const authApi = {
  getSession: (): Promise<AxiosResponse<SessionUser>> => {
    return apiClient.get<SessionUser>(API_ENDPOINTS.USERS.ME);
  },

  getAuthStatus: (): Promise<AxiosResponse<AuthStatus>> => {
    return apiClient.get<SessionUser>(API_ENDPOINTS.USERS.ME).then((res) => {
      return {
        ...res,
        data: {
          authenticated: res.status === 200,
        },
      };
    });
  },

  mobileLogin: (payload: {
    username?: string;
    password?: string;
  }): Promise<AxiosResponse<MobileTokenResponse>> => {
    return publicApiClient.post<MobileTokenResponse>(
      API_ENDPOINTS.AUTH.MOBILE_LOGIN,
      payload,
    );
  },

  loginDirect: (
    username: string,
    password: string,
  ): Promise<AxiosResponse<MobileTokenResponse>> => {
    return publicApiClient.post<MobileTokenResponse>(
      API_ENDPOINTS.AUTH.MOBILE_LOGIN,
      { username, password },
    );
  },

  mobileRegister: (payload: {
    username?: string;
    email?: string;
    password?: string;
  }): Promise<AxiosResponse<MobileTokenResponse>> => {
    return publicApiClient.post<MobileTokenResponse>(
      API_ENDPOINTS.AUTH.MOBILE_REGISTER,
      payload,
    );
  },

  registerDirect: (
    email: string,
    password: string,
    name: string,
  ): Promise<AxiosResponse<MobileTokenResponse>> => {
    return publicApiClient.post<MobileTokenResponse>(
      API_ENDPOINTS.AUTH.MOBILE_REGISTER,
      { email, password, name },
    );
  },

  mobileRefreshToken: (
    payload: RefreshTokenRequestDto,
  ): Promise<AxiosResponse<RefreshTokenResponse>> => {
    return publicApiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.MOBILE_REFRESH,
      payload,
    );
  },

  refreshToken: (
    payload: RefreshTokenRequestDto,
  ): Promise<AxiosResponse<RefreshTokenResponse>> => {
    return publicApiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.MOBILE_REFRESH,
      payload,
    );
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, undefined, {
        skipAuthRefresh: true,
      });
    } catch {
      // Ignore errors if session already destroyed
    } finally {
      tokenStorage.clear();
    }
  },
};
