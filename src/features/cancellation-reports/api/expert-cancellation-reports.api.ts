import type { AxiosResponse } from "axios";

import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  ExpertCancellationPolicyDto,
  ExpertCancellationStatsQuery,
  ExpertCancellationStatsResponse,
  UpdateExpertCancellationPolicyDto,
} from "../types/expert-cancellation-report.types";

export const expertCancellationReportsApi = {
  getAdminStats: (
    query: ExpertCancellationStatsQuery,
  ): Promise<AxiosResponse<ExpertCancellationStatsResponse>> =>
    apiClient.get(API_ENDPOINTS.ADMIN_EXPERT_CANCELLATIONS.STATS, {
      params: {
        days: query.days,
        clinicId: query.clinicId,
      },
    }),

  getClinicStats: (
    query: Pick<ExpertCancellationStatsQuery, "days">,
  ): Promise<AxiosResponse<ExpertCancellationStatsResponse>> =>
    apiClient.get(API_ENDPOINTS.CLINIC.EXPERT_CANCELLATION_STATS, {
      params: { days: query.days },
    }),

  getPolicy: (): Promise<AxiosResponse<ExpertCancellationPolicyDto>> =>
    apiClient.get(API_ENDPOINTS.ADMIN_EXPERT_CANCELLATIONS.POLICY),

  updatePolicy: (
    data: UpdateExpertCancellationPolicyDto,
  ): Promise<AxiosResponse<ExpertCancellationPolicyDto>> =>
    apiClient.patch(API_ENDPOINTS.ADMIN_EXPERT_CANCELLATIONS.POLICY, data),
};
