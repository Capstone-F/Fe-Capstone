import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface AdminClinic {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminClinicListResponse {
  items: AdminClinic[];
  total: number;
}

export interface ListAdminClinicsQuery {
  q?: string;
  activeOnly?: boolean;
}

export interface CreateAdminClinicDto {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export const adminClinicsApi = {
  getClinics: (
    query?: ListAdminClinicsQuery,
  ): Promise<AxiosResponse<AdminClinicListResponse>> => {
    const params: Record<string, string> = {};
    if (query?.q?.trim()) params.q = query.q.trim();
    if (query?.activeOnly) params.activeOnly = "true";

    return apiClient.get<AdminClinicListResponse>(
      API_ENDPOINTS.ADMIN_CLINICS.LIST,
      { params },
    );
  },

  createClinic: (
    body: CreateAdminClinicDto,
  ): Promise<AxiosResponse<AdminClinic>> => {
    return apiClient.post<AdminClinic>(
      API_ENDPOINTS.ADMIN_CLINICS.CREATE,
      body,
    );
  },

  updateClinic: (
    id: string,
    body: Partial<CreateAdminClinicDto>,
  ): Promise<AxiosResponse<AdminClinic>> => {
    return apiClient.patch<AdminClinic>(
      API_ENDPOINTS.ADMIN_CLINICS.UPDATE(id),
      body,
    );
  },

  deactivateClinic: (id: string): Promise<AxiosResponse<AdminClinic>> => {
    return apiClient.delete<AdminClinic>(
      API_ENDPOINTS.ADMIN_CLINICS.DEACTIVATE(id),
    );
  },
};
