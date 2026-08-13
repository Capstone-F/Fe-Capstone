import { useQuery, useMutation, keepPreviousData } from "@tanstack/react-query";
import {
  clinicStatementApi,
  ListTransactionsQuery,
} from "../api/clinic-statement.api";
import { toast } from "sonner";

export function useClinicTransactions(query?: ListTransactionsQuery) {
  return useQuery({
    queryKey: ["clinic-transactions", query],
    queryFn: async () => {
      const res = await clinicStatementApi.getTransactions(query);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useExportClinicTransactionsCsv() {
  return useMutation({
    mutationFn: async (
      query?: Omit<ListTransactionsQuery, "page" | "limit">,
    ) => {
      const response = await clinicStatementApi.exportCsv(query);
      return {
        data: response.data,
        headers: response.headers,
      };
    },
    onSuccess: ({ data, headers }) => {
      let filename = "clinic-transactions.csv";
      const disposition = headers["content-disposition"];
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Đã xuất file báo cáo CSV thành công!");
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      toast.error(msg || "Không thể xuất file CSV.");
    },
  });
}
