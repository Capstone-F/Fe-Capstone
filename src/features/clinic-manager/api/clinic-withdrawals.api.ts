import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface ClinicWithdrawalItem {
  id: string;
  clinicId: string;
  amountVnd: string; // integer VND as string
  status: "REQUESTED" | "PAID" | "REJECTED";
  requestedByUserId: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  processedByUserId: string | null;
  processedAt: string | null;
  transferRef: string | null;
  staffNote: string | null; // Admin note
  debitTransactionId: string | null;
  refundTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedWithdrawalsResponse {
  items: ClinicWithdrawalItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ListWithdrawalsQuery {
  page?: number;
  limit?: number;
}

export const clinicWithdrawalsApi = {
  requestWithdrawal: (
    amountVnd: number,
  ): Promise<AxiosResponse<ClinicWithdrawalItem>> => {
    return apiClient.post<ClinicWithdrawalItem>(
      API_ENDPOINTS.CLINIC.WITHDRAWALS,
      {
        amountVnd,
      },
    );
  },

  getMyWithdrawals: (
    query?: ListWithdrawalsQuery,
  ): Promise<AxiosResponse<PaginatedWithdrawalsResponse>> => {
    return apiClient.get<PaginatedWithdrawalsResponse>(
      API_ENDPOINTS.CLINIC.WITHDRAWALS,
      {
        params: {
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      },
    );
  },
};
