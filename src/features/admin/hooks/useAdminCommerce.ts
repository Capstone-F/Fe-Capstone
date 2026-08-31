"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminCommerceApi,
  type ComboDiscountKind,
  type ComboDiscountSettings,
} from "../api/admin-commerce.api";
import { queryKeys } from "@/lib/query/keys";

export function useAdminComboDiscount(kind: ComboDiscountKind) {
  return useQuery({
    queryKey: queryKeys.adminComboDiscount(kind),
    queryFn: () =>
      adminCommerceApi.getComboDiscount(kind).then((res) => res.data),
    staleTime: 60 * 1000,
  });
}

export function useUpdateComboDiscount(kind: ComboDiscountKind) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ComboDiscountSettings) =>
      adminCommerceApi.updateComboDiscount(kind, data),
    onSuccess: () => {
      toast.success("Đã cập nhật cấu hình giảm giá combo thành công!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminComboDiscount(kind),
      });
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật cấu hình giảm giá combo";
      toast.error(msg);
    },
  });
}
