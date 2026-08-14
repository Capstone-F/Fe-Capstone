"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminCommerceApi,
  type ComboDiscountSettings,
} from "../api/admin-commerce.api";
import { queryKeys } from "@/lib/query/keys";

export function useAdminComboDiscount() {
  return useQuery({
    queryKey: queryKeys.adminComboDiscount,
    queryFn: () => adminCommerceApi.getComboDiscount().then((res) => res.data),
    staleTime: 60 * 1000,
  });
}

export function useUpdateComboDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ComboDiscountSettings) =>
      adminCommerceApi.updateComboDiscount(data),
    onSuccess: () => {
      toast.success("Đã cập nhật cấu hình giảm giá combo thành công!");
      queryClient.invalidateQueries({ queryKey: queryKeys.adminComboDiscount });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật cấu hình giảm giá combo";
      toast.error(msg);
    },
  });
}

export function useAdminPlatformCommission() {
  return useQuery({
    queryKey: queryKeys.adminPlatformCommission,
    queryFn: () =>
      adminCommerceApi.getPlatformCommission().then((res) => res.data),
    staleTime: 60 * 1000,
  });
}

export function useUpdatePlatformCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (percent: number) =>
      adminCommerceApi.updatePlatformCommission(percent),
    onSuccess: () => {
      toast.success("Đã cập nhật tỷ lệ hoa hồng nền tảng thành công!");
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminPlatformCommission,
      });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Tỷ lệ hoa hồng phải là số nằm trong khoảng 0 đến 100";
      toast.error(msg);
    },
  });
}
