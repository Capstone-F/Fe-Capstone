import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface ClinicExpertItem {
  id: string; // profile id
  userId: string;
  clinicId: string;
  name?: string;
  email?: string;
  specialization: string;
  consultationFee: number;
  licenseNumber?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  user?: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
  };
  createdAt: string;
}

export interface PaginatedClinicExpertsResponse {
  items: ClinicExpertItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ListClinicExpertsQuery {
  search?: string;
  specialization?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateExpertUserDto {
  name: string;
  email: string;
  temporaryPassword: string;
  role: "expert";
  clinicId: string;
}

export interface CreateExpertProfileDto {
  userId: string;
  clinicId: string;
  specialization: string;
  consultationFee: number;
  licenseNumber?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UpdateExpertProfileDto {
  specialization?: string;
  licenseNumber?: string;
  bio?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface ExpertAvailabilitySlot {
  id: string;
  expertId: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  startHour: number;
  endHour: number;
  createdAt?: string;
  updatedAt?: string;
}

export const clinicExpertsApi = {
  getClinicExperts: (
    query?: ListClinicExpertsQuery,
  ): Promise<AxiosResponse<PaginatedClinicExpertsResponse>> => {
    return apiClient.get<PaginatedClinicExpertsResponse>(
      API_ENDPOINTS.CLINIC.EXPERTS,
      {
        params: {
          search: query?.search || undefined,
          specialization: query?.specialization || undefined,
          isActive: query?.isActive !== undefined ? query.isActive : undefined,
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      },
    );
  },

  createUser: (
    dto: CreateExpertUserDto,
  ): Promise<AxiosResponse<{ id: string; email: string; name: string }>> => {
    return apiClient.post(API_ENDPOINTS.USERS.CREATE, dto);
  },

  createProfile: (
    dto: CreateExpertProfileDto,
  ): Promise<AxiosResponse<ClinicExpertItem>> => {
    return apiClient.post(API_ENDPOINTS.EXPERTS.CREATE, dto);
  },

  updateProfile: (
    id: string,
    dto: UpdateExpertProfileDto,
  ): Promise<AxiosResponse<ClinicExpertItem>> => {
    return apiClient.patch(API_ENDPOINTS.EXPERTS.DETAIL(id), dto);
  },

  updateConsultationFee: (
    id: string,
    consultationFee: number,
  ): Promise<AxiosResponse<ClinicExpertItem>> => {
    return apiClient.put(API_ENDPOINTS.EXPERTS.CONSULTATION_FEE(id), {
      consultationFee,
    });
  },

  getAvailability: (
    expertId: string,
  ): Promise<AxiosResponse<ExpertAvailabilitySlot[]>> => {
    return apiClient.get(API_ENDPOINTS.EXPERTS.AVAILABILITY(expertId));
  },

  createAvailability: (
    expertId: string,
    slot: Omit<ExpertAvailabilitySlot, "id" | "expertId">,
  ): Promise<AxiosResponse<ExpertAvailabilitySlot>> => {
    return apiClient.post(API_ENDPOINTS.EXPERTS.AVAILABILITY(expertId), slot);
  },

  deleteAvailability: (
    expertId: string,
    id: string,
  ): Promise<AxiosResponse<void>> => {
    return apiClient.delete(
      API_ENDPOINTS.EXPERTS.AVAILABILITY_DETAIL(expertId, id),
    );
  },
};
