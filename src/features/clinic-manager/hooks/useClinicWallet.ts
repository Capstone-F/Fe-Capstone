import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clinicWalletApi,
  UpdateBankAccountDto,
} from "../api/clinic-wallet.api";
import { toast } from "sonner";

export function useClinicWallet() {
  return useQuery({
    queryKey: ["clinic-wallet"],
    queryFn: async () => {
      const res = await clinicWalletApi.getWallet();
      return res.data;
    },
  });
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateBankAccountDto) =>
      clinicWalletApi.updateBankAccount(dto),
    onSuccess: () => {
      toast.success("Cập nhật thông tin tài khoản ngân hàng thành công!");
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
      toast.error(msg || "Cập nhật ngân hàng thất bại.");
    },
  });
}
