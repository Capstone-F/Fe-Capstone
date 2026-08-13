import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export type TransactionType =
  | "CONSULTATION_PAYMENT"
  | "TREATMENT_PLAN_PAYMENT"
  | "REFUND"
  | "ESCROW_RELEASE"
  | "COMMISSION"
  | "WITHDRAWAL"
  | "WITHDRAWAL_REVERSAL";

export interface ClinicTransactionItem {
  id: string;
  clinicId: string;
  type: TransactionType;
  amountVnd: string;
  status: string;
  expertId?: string | null;
  consultationId?: string | null;
  treatmentId?: string | null;
  treatmentPhaseId?: string | null;
  withdrawalId?: string | null;
  externalRef?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface PaginatedTransactionsResponse {
  items: ClinicTransactionItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ListTransactionsQuery {
  search?: string;
  type?: string;
  expertId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const clinicStatementApi = {
  getTransactions: (
    query?: ListTransactionsQuery,
  ): Promise<AxiosResponse<PaginatedTransactionsResponse>> => {
    return apiClient.get<PaginatedTransactionsResponse>(
      API_ENDPOINTS.CLINIC.TRANSACTIONS,
      {
        params: {
          search: query?.search || undefined,
          type: query?.type || undefined,
          expertId: query?.expertId || undefined,
          from: query?.from || undefined,
          to: query?.to || undefined,
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      },
    );
  },

  exportCsv: (
    query?: Omit<ListTransactionsQuery, "page" | "limit">,
  ): Promise<AxiosResponse<Blob>> => {
    return apiClient.get<Blob>(API_ENDPOINTS.CLINIC.TRANSACTIONS_EXPORT, {
      params: {
        type: query?.type || undefined,
        expertId: query?.expertId || undefined,
        from: query?.from || undefined,
        to: query?.to || undefined,
      },
      responseType: "blob",
    });
  },
};
