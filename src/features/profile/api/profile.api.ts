import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  AllergyLabelResponse,
  CustomerProfileResponse,
  UpdateSkinTypeBody,
} from "../types/profile.types";
import type { SessionUser } from "@/features/auth/types/auth.types";

export const profileApi = {
  getUserMe: (): Promise<AxiosResponse<SessionUser>> => {
    return apiClient.get<SessionUser>(API_ENDPOINTS.USERS.ME);
  },

  patchUserMe: (name: string): Promise<AxiosResponse<SessionUser>> => {
    return apiClient.patch<SessionUser>(API_ENDPOINTS.USERS.ME, { name });
  },

  getCustomerMe: (): Promise<AxiosResponse<CustomerProfileResponse>> => {
    return apiClient.get<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.ME);
  },

  patchCustomerMe: (
    body: Record<string, unknown>,
  ): Promise<AxiosResponse<CustomerProfileResponse>> => {
    return apiClient.patch<CustomerProfileResponse>(
      API_ENDPOINTS.CUSTOMERS.ME,
      body,
    );
  },

  patchSkinType: (
    body: UpdateSkinTypeBody,
  ): Promise<AxiosResponse<CustomerProfileResponse>> => {
    return apiClient.patch<CustomerProfileResponse>(
      API_ENDPOINTS.CUSTOMERS.SKIN_TYPE,
      body,
    );
  },

  getAllergyOptions: (): Promise<AxiosResponse<AllergyLabelResponse[]>> => {
    return apiClient.get<AllergyLabelResponse[]>(
      API_ENDPOINTS.CUSTOMERS.ALLERGIES,
    );
  },
};
