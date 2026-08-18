import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  ListAdminTransactionsQuery,
  PaginatedAdminTransactions,
} from "../types/ledger.types";

export const adminLedgerApi = {
  list: (
    query?: ListAdminTransactionsQuery,
  ): Promise<AxiosResponse<PaginatedAdminTransactions>> => {
    return apiClient.get<PaginatedAdminTransactions>(
      API_ENDPOINTS.ADMIN_TRANSACTIONS.LIST,
      { params: { page: 1, limit: 20, ...query } },
    );
  },

  exportCsv: (
    query?: Omit<ListAdminTransactionsQuery, "page" | "limit">,
  ): Promise<AxiosResponse<Blob>> => {
    return apiClient.get<Blob>(API_ENDPOINTS.ADMIN_TRANSACTIONS.EXPORT, {
      params: query,
      responseType: "blob",
    });
  },
};
