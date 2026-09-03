"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query/keys";
import { adminBookingSettingsApi } from "../api/admin-booking-settings.api";
import type { UpdateBookingSettingsDto } from "../types/admin-booking-settings.types";

export function useBookingSettings() {
  return useQuery({
    queryKey: queryKeys.bookingSettings,
    queryFn: () => adminBookingSettingsApi.get().then((res) => res.data),
    staleTime: 60 * 1000,
  });
}

export function useUpdateBookingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBookingSettingsDto) =>
      adminBookingSettingsApi.update(data).then((res) => res.data),
    onSuccess: (data) => {
      toast.success("Đã cập nhật cài đặt lịch hẹn thành công!");
      queryClient.setQueryData(queryKeys.bookingSettings, data);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookingSettings,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.expertCancellationPolicy,
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật cài đặt lịch hẹn.";
      toast.error(message);
    },
  });
}
