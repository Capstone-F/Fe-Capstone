import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { adminLedgerApi } from "../api/admin-ledger.api";
import type { ListAdminTransactionsQuery } from "../types/ledger.types";

export function useAdminTransactions(query: ListAdminTransactionsQuery) {
  return useQuery({
    queryKey: queryKeys.adminTransactions(query),
    queryFn: () => adminLedgerApi.list(query).then((res) => res.data),
    // Keeps the previous page on screen while the next one fetches, so paging
    // doesn't blank the table or momentarily render "Trang 2 / 1".
    placeholderData: keepPreviousData,
  });
}

export function useExportLedgerCsv() {
  return useMutation({
    mutationFn: async (
      query: Omit<ListAdminTransactionsQuery, "page" | "limit">,
    ) => {
      const response = await adminLedgerApi.exportCsv(query);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "so-cai-giao-dich.csv";
      link.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error("Không thể xuất file CSV. Vui lòng thử lại.");
    },
  });
}
