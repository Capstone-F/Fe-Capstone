import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface CreateManagedUserPayload {
  email: string;
  name: string;
  role: "expert" | "staff" | "clinic_manager";
  clinicId?: string;
  temporaryPassword?: string;
}

export interface ManagedUserResponse {
  id: string;
  email: string;
  name: string;
  roles: string[];
  clinicId?: string | null;
  createdAt: string;
}

export interface ClinicResponse {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export interface PaginatedClinicsResponse {
  items: ClinicResponse[];
  total: number;
}

export interface PaginatedUsersResponse {
  items: ManagedUserResponse[];
  total: number;
}

export const adminUsersApi = {
  createUser: (
    payload: CreateManagedUserPayload,
  ): Promise<AxiosResponse<ManagedUserResponse>> => {
    return apiClient.post<ManagedUserResponse>(
      API_ENDPOINTS.USERS.CREATE,
      payload,
    );
  },

  getUsers: (params?: {
    role?: string;
    clinicId?: string;
    page?: number;
    limit?: number;
  }): Promise<AxiosResponse<PaginatedUsersResponse>> => {
    return apiClient.get<PaginatedUsersResponse>(API_ENDPOINTS.USERS.LIST, {
      params,
    });
  },

  getClinics: (): Promise<AxiosResponse<PaginatedClinicsResponse>> => {
    return apiClient.get<PaginatedClinicsResponse>(API_ENDPOINTS.CLINICS.LIST);
  },

  getCustomers: (): Promise<AxiosResponse<PaginatedUsersResponse>> => {
    return apiClient.get<PaginatedUsersResponse>(API_ENDPOINTS.USERS.LIST, {
      params: { role: "customer" },
    });
  },
};
