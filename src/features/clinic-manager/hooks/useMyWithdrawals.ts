import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clinicWithdrawalsApi,
  ListWithdrawalsQuery,
} from "../api/clinic-withdrawals.api";
import { toast } from "sonner";

export function useMyWithdrawals(query?: ListWithdrawalsQuery) {
  return useQuery({
    queryKey: ["my-clinic-withdrawals", query],
    queryFn: async () => {
      const res = await clinicWithdrawalsApi.getMyWithdrawals(query);
      return res.data;
    },
  });
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amountVnd: number) =>
      clinicWithdrawalsApi.requestWithdrawal(amountVnd),
    onSuccess: () => {
      toast.success(
        "Tiền đã được đóng băng ngay lập tức và tạo yêu cầu rút thành công!",
      );
      queryClient.invalidateQueries({ queryKey: ["my-clinic-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["clinic-wallet"] });
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      toast.error(msg || "Yêu cầu rút tiền thất bại.");
    },
  });
}
