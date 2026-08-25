import type { AxiosResponse } from "axios";

import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  ExpertCancellationStatsQuery,
  ExpertCancellationStatsResponse,
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
};
