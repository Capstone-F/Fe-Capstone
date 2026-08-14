import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface ClinicWithdrawalItem {
  id: string;
  clinicId: string;
  clinicName?: string | null;
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

export interface PaginatedAdminWithdrawalsResponse {
  items: ClinicWithdrawalItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ListAdminWithdrawalsQuery {
  clinicId?: string;
  status?: "REQUESTED" | "PAID" | "REJECTED" | "ALL";
  page?: number;
  limit?: number;
}

export interface MarkPaidDto {
  transferRef?: string;
  note?: string;
}

export interface RejectWithdrawalDto {
  note?: string;
}

export const adminClinicWithdrawalsApi = {
  listWithdrawals: (
    query?: ListAdminWithdrawalsQuery,
  ): Promise<AxiosResponse<PaginatedAdminWithdrawalsResponse>> => {
    return apiClient.get<PaginatedAdminWithdrawalsResponse>(
      API_ENDPOINTS.ADMIN_CLINIC_WITHDRAWALS.LIST,
      {
        params: {
          clinicId: query?.clinicId || undefined,
          status:
            query?.status && query.status !== "ALL" ? query.status : undefined,
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      },
    );
  },

  markPaid: (
    id: string,
    dto: MarkPaidDto,
  ): Promise<AxiosResponse<ClinicWithdrawalItem>> => {
    return apiClient.post<ClinicWithdrawalItem>(
      API_ENDPOINTS.ADMIN_CLINIC_WITHDRAWALS.MARK_PAID(id),
      dto,
    );
  },

  reject: (
    id: string,
    dto: RejectWithdrawalDto,
  ): Promise<AxiosResponse<ClinicWithdrawalItem>> => {
    return apiClient.post<ClinicWithdrawalItem>(
      API_ENDPOINTS.ADMIN_CLINIC_WITHDRAWALS.REJECT(id),
      dto,
    );
  },
};
