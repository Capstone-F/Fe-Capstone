import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  AdminExpertProfile,
  CreateAvailabilityPayload,
  ExpertAvailabilityBlock,
  ExpertAvailabilityList,
  UpdateAvailabilityPayload,
} from "../types/expert-admin.types";

/** Thin Axios wrappers for expert fee + availability maintenance. No mapping, no React. */
export const adminExpertsApi = {
  /** Raw profiles — unlike the discovery hook, this keeps `email`, the only link back to the account. */
  listProfiles: (): Promise<
    AxiosResponse<{ items: AdminExpertProfile[]; total: number }>
  > => apiClient.get(API_ENDPOINTS.EXPERTS.LIST, { params: { limit: 100 } }),

  updateConsultationFee: (
    expertProfileId: string,
    consultationFee: number,
  ): Promise<AxiosResponse<AdminExpertProfile>> =>
    apiClient.put(API_ENDPOINTS.EXPERTS.CONSULTATION_FEE(expertProfileId), {
      consultationFee,
    }),

  updateExpert: (
    expertProfileId: string,
    payload: { clinicId?: string; specialization?: string; isActive?: boolean },
  ): Promise<AxiosResponse<AdminExpertProfile>> =>
    apiClient.patch(API_ENDPOINTS.EXPERTS.DETAIL(expertProfileId), payload),

  getAvailability: (
    expertProfileId: string,
  ): Promise<AxiosResponse<ExpertAvailabilityList>> =>
    apiClient.get(API_ENDPOINTS.EXPERTS.AVAILABILITY(expertProfileId)),

  createAvailability: (
    expertProfileId: string,
    payload: CreateAvailabilityPayload,
  ): Promise<AxiosResponse<ExpertAvailabilityBlock>> =>
    apiClient.post(
      API_ENDPOINTS.EXPERTS.AVAILABILITY(expertProfileId),
      payload,
    ),

  updateAvailability: (
    expertProfileId: string,
    blockId: string,
    payload: UpdateAvailabilityPayload,
  ): Promise<AxiosResponse<ExpertAvailabilityBlock>> =>
    apiClient.patch(
      API_ENDPOINTS.EXPERTS.AVAILABILITY_DETAIL(expertProfileId, blockId),
      payload,
    ),

  deleteAvailability: (
    expertProfileId: string,
    blockId: string,
  ): Promise<AxiosResponse<void>> =>
    apiClient.delete(
      API_ENDPOINTS.EXPERTS.AVAILABILITY_DETAIL(expertProfileId, blockId),
    ),
};
