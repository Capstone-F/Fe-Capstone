import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  Clinic,
  ListClinicsQuery,
  PaginatedClinicsResponse,
} from "../types/clinic.types";
import type { BackendExpert } from "@/features/experts/types/expert.types";

export interface ClinicExpertsResponse {
  items: BackendExpert[];
  total: number;
}

export const clinicsApi = {
  getClinics: (
    query?: ListClinicsQuery,
  ): Promise<AxiosResponse<PaginatedClinicsResponse>> => {
    return apiClient.get<PaginatedClinicsResponse>(API_ENDPOINTS.CLINICS.LIST, {
      params: {
        page: query?.page ?? 1,
        limit: query?.limit ?? 20,
      },
    });
  },

  getClinicById: (id: string): Promise<AxiosResponse<Clinic>> => {
    return apiClient.get<Clinic>(API_ENDPOINTS.CLINICS.DETAIL(id));
  },

  getClinicExperts: (
    id: string,
  ): Promise<AxiosResponse<ClinicExpertsResponse>> => {
    return apiClient.get<ClinicExpertsResponse>(
      API_ENDPOINTS.CLINICS.EXPERTS(id),
    );
  },
};
