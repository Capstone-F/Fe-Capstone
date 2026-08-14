"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminClinicWithdrawalsApi,
  type ListAdminWithdrawalsQuery,
  type MarkPaidDto,
  type RejectWithdrawalDto,
} from "../api/admin-clinic-withdrawals.api";
import { queryKeys } from "@/lib/query/keys";

export function useAdminClinicWithdrawals(query?: ListAdminWithdrawalsQuery) {
  return useQuery({
    queryKey: queryKeys.adminClinicWithdrawals(query),
    queryFn: () =>
      adminClinicWithdrawalsApi.listWithdrawals(query).then((res) => res.data),
    staleTime: 30 * 1000,
  });
}

export function useMarkWithdrawalPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: MarkPaidDto }) =>
      adminClinicWithdrawalsApi.markPaid(id, dto),
    onSuccess: () => {
      toast.success("Đã xác nhận thanh toán rút tiền thành công!");
      queryClient.invalidateQueries({
        queryKey: ["admin", "clinic-withdrawals"],
      });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể duyệt thanh toán";
      toast.error(msg);
    },
  });
}

export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RejectWithdrawalDto }) =>
      adminClinicWithdrawalsApi.reject(id, dto),
    onSuccess: () => {
      toast.success("Đã từ chối yêu cầu rút tiền.");
      queryClient.invalidateQueries({
        queryKey: ["admin", "clinic-withdrawals"],
      });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể từ chối yêu cầu";
      toast.error(msg);
    },
  });
}
