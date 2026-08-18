import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

/** All figures here are point-in-time or all-time, never period-scoped. */
export interface ClinicBalance {
  clinicId: string;
  clinicName: string;
  balanceVnd: string;
  heldEscrowVnd: string;
  pendingWithdrawalsVnd: string;
  /** All-time, NOT period-scoped. */
  commissionEarnedVnd: string;
  lastPayoutAt: string | null;
}

export interface PaginatedClinicBalances {
  items: ClinicBalance[];
  total: number;
  page: number;
  limit: number;
}

export interface ListClinicBalancesQuery {
  clinicId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminFinanceApi = {
  getClinicBalances: (
    query?: ListClinicBalancesQuery,
  ): Promise<AxiosResponse<PaginatedClinicBalances>> => {
    return apiClient.get<PaginatedClinicBalances>(
      API_ENDPOINTS.ADMIN_CLINICS.BALANCES,
      { params: { page: 1, limit: 20, ...query } },
    );
  },
};
