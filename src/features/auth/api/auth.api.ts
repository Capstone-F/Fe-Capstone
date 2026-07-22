import { apiClient, publicApiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
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
    return apiClient.get<AuthStatus>(API_ENDPOINTS.USERS.ME).then((res) => {
      // Map AxiosResponse to match expected structure
      return {
        ...res,
        data: { authenticated: res.status === 200 },
      };
    });
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

  refreshToken: (
    payload: RefreshTokenRequestDto,
  ): Promise<AxiosResponse<RefreshTokenResponse>> => {
    return publicApiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.MOBILE_REFRESH,
      payload,
    );
  },

  logout: (): Promise<void> => {
    return Promise.resolve();
  },
};
