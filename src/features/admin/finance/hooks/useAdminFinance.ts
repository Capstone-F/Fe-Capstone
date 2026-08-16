import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  adminClinicWithdrawalsApi,
  type ClinicWithdrawalItem,
} from "@/features/admin/api/admin-clinic-withdrawals.api";
import { cancellationsApi } from "@/features/admin/cancellations/api/cancellations.api";
import type { OrderCancellation } from "@/features/admin/cancellations/types/cancellation.types";
import type { BoundedFetchResult } from "../types/finance.types";

/**
 * WHY bounded: neither endpoint supports date filtering, so period totals require
 * the whole set. Withdrawals are a hand-approved queue (low volume); cancellations
 * scale with orders, so truncation is surfaced in the UI rather than hidden.
 * Replaced by GET /admin/transactions — see docs/admin-finance-be-handoff.md.
 */
export const FINANCE_PAGE_SIZE = 100;
export const FINANCE_ROW_CAP = 500;

const MAX_PAGES = Math.ceil(FINANCE_ROW_CAP / FINANCE_PAGE_SIZE);

export function useAllClinicWithdrawals() {
  return useQuery({
    queryKey: queryKeys.adminClinicWithdrawalsAll,
    queryFn: async (): Promise<BoundedFetchResult<ClinicWithdrawalItem>> => {
      const items: ClinicWithdrawalItem[] = [];
      let total = 0;

      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const response = await adminClinicWithdrawalsApi.listWithdrawals({
          status: "ALL",
          page,
          limit: FINANCE_PAGE_SIZE,
        });
        total = response.data.total;
        // Guard against a server that reports a total it cannot page through.
        if (response.data.items.length === 0) break;
        items.push(...response.data.items);
        if (items.length >= total) break;
      }

      return {
        items: items.slice(0, FINANCE_ROW_CAP),
        truncated: total > FINANCE_ROW_CAP,
        cap: FINANCE_ROW_CAP,
      };
    },
  });
}

export function useAllCancellations() {
  return useQuery({
    queryKey: queryKeys.adminCancellationsAll,
    queryFn: async (): Promise<BoundedFetchResult<OrderCancellation>> => {
      const items: OrderCancellation[] = [];
      let total = 0;

      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const response = await cancellationsApi.getCancellations({
          status: "ALL",
          page,
          limit: FINANCE_PAGE_SIZE,
        });
        total = response.data.total;
        if (response.data.items.length === 0) break;
        items.push(...response.data.items);
        if (items.length >= total) break;
      }

      return {
        items: items.slice(0, FINANCE_ROW_CAP),
        truncated: total > FINANCE_ROW_CAP,
        cap: FINANCE_ROW_CAP,
      };
    },
  });
}
