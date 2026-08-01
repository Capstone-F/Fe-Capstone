import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type { BackendExpert } from "../types/expert.types";

export const expertsApi = {
  getExperts: (
    params: Record<string, string>,
  ): Promise<AxiosResponse<{ items: BackendExpert[] }>> => {
    return apiClient.get<{ items: BackendExpert[] }>(
      API_ENDPOINTS.EXPERTS.LIST,
      { params },
    );
  },

  getExpertById: (id: string): Promise<AxiosResponse<BackendExpert>> => {
    return apiClient.get<BackendExpert>(API_ENDPOINTS.EXPERTS.DETAIL(id));
  },

  getMe: (): Promise<AxiosResponse<BackendExpert>> => {
    return apiClient.get<BackendExpert>(API_ENDPOINTS.EXPERTS.ME);
  },
};
