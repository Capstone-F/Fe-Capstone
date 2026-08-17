import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  adminClinicWithdrawalsApi,
  type ClinicWithdrawalItem,
} from "@/features/admin/api/admin-clinic-withdrawals.api";
import { cancellationsApi } from "@/features/admin/cancellations/api/cancellations.api";
import type { OrderCancellation } from "@/features/admin/cancellations/types/cancellation.types";
import { fetchAllPages } from "../lib/paged-fetch";

/**
 * WHY bounded: neither endpoint supports date filtering, so period totals require
 * the whole set. Withdrawals are a hand-approved queue (low volume); cancellations
 * scale with orders, so truncation is surfaced in the UI rather than hidden.
 * Replaced by GET /admin/transactions — see docs/admin-finance-be-handoff.md.
 */
export const FINANCE_PAGE_SIZE = 100;
export const FINANCE_ROW_CAP = 500;

export function useAllClinicWithdrawals() {
  return useQuery({
    queryKey: queryKeys.adminClinicWithdrawalsAll,
    queryFn: () =>
      fetchAllPages<ClinicWithdrawalItem>(
        async (page) => {
          const response = await adminClinicWithdrawalsApi.listWithdrawals({
            status: "ALL",
            page,
            limit: FINANCE_PAGE_SIZE,
          });
          return response.data;
        },
        FINANCE_PAGE_SIZE,
        FINANCE_ROW_CAP,
      ),
  });
}

export function useAllCancellations() {
  return useQuery({
    queryKey: queryKeys.adminCancellationsAll,
    queryFn: () =>
      fetchAllPages<OrderCancellation>(
        async (page) => {
          const response = await cancellationsApi.getCancellations({
            status: "ALL",
            page,
            limit: FINANCE_PAGE_SIZE,
          });
          return response.data;
        },
        FINANCE_PAGE_SIZE,
        FINANCE_ROW_CAP,
      ),
  });
}
