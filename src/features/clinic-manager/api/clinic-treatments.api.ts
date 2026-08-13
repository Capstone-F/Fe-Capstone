import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface TreatmentPhaseItem {
  id: string;
  phaseOrder: number;
  phaseType: string;
  status: "PENDING" | "ACTIVE" | "COMPLETED";
  priceVnd: string | number;
}

export interface EscrowSummary {
  heldVnd: string;
  releasedVnd: string;
  refundedVnd: string;
}

export interface ClinicTreatmentItem {
  id: string;
  title: string;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  totalPriceVnd: string | number;
  expertId: string;
  expertName?: string;
  customerName?: string;
  phases: TreatmentPhaseItem[];
  escrow: EscrowSummary;
  createdAt: string;
}

export interface PaginatedClinicTreatmentsResponse {
  items: ClinicTreatmentItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ListClinicTreatmentsQuery {
  search?: string;
  status?: string;
  expertId?: string;
  page?: number;
  limit?: number;
}

export const clinicTreatmentsApi = {
  getClinicTreatments: (
    query?: ListClinicTreatmentsQuery,
  ): Promise<AxiosResponse<PaginatedClinicTreatmentsResponse>> => {
    return apiClient.get<PaginatedClinicTreatmentsResponse>(
      API_ENDPOINTS.CLINIC.TREATMENTS,
      {
        params: {
          search: query?.search || undefined,
          status: query?.status || undefined,
          expertId: query?.expertId || undefined,
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      },
    );
  },

  getClinicTreatmentDetail: (
    id: string,
  ): Promise<AxiosResponse<ClinicTreatmentItem>> => {
    return apiClient.get<ClinicTreatmentItem>(
      API_ENDPOINTS.CLINIC.TREATMENT_DETAIL(id),
    );
  },
};
