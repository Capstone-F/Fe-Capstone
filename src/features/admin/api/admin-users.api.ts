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
  keycloakSub: string;
  email: string | null;
  name: string | null;
  provider: string;
  roles: string[];
  clinicId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpertProfilePayload {
  userId: string;
  clinicId: string;
  specialization: string;
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
  page: number;
  limit: number;
}

export interface AdminWalletResponse {
  id: string;
  userId: string;
  balanceVnd: string;
  isActive: boolean;
}

export interface AdminWalletTopUpResponse {
  walletId: string;
  userId: string;
  balanceVnd: string;
  transactionId: string;
  amountVnd: string;
  note: string | null;
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

  createExpertProfile: (
    payload: CreateExpertProfilePayload,
  ): Promise<AxiosResponse<unknown>> => {
    return apiClient.post(API_ENDPOINTS.EXPERTS.CREATE, payload);
  },

  getUsers: (params?: {
    q?: string;
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

  getUser: (id: string): Promise<AxiosResponse<ManagedUserResponse>> =>
    apiClient.get(API_ENDPOINTS.USERS.DETAIL(id)),

  updateRoles: (
    id: string,
    roles: string[],
  ): Promise<AxiosResponse<ManagedUserResponse>> =>
    apiClient.patch(API_ENDPOINTS.USERS.ROLES(id), { roles }),

  updateStatus: (
    id: string,
    isActive: boolean,
  ): Promise<AxiosResponse<ManagedUserResponse>> =>
    apiClient.patch(API_ENDPOINTS.USERS.STATUS(id), { isActive }),

  getWallet: (userId: string): Promise<AxiosResponse<AdminWalletResponse>> =>
    apiClient.get(API_ENDPOINTS.ADMIN_WALLETS.DETAIL(userId)),

  topUpWallet: (
    userId: string,
    amountVnd: number,
    note?: string,
  ): Promise<AxiosResponse<AdminWalletTopUpResponse>> =>
    apiClient.post(API_ENDPOINTS.ADMIN_WALLETS.TOP_UP(userId), {
      amountVnd,
      note: note?.trim() || undefined,
    }),
};
