"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { queryKeys } from "@/lib/query/keys";
import { expertCancellationReportsApi } from "../api/expert-cancellation-reports.api";
import type {
  ExpertCancellationStatsQuery,
  UpdateExpertCancellationPolicyDto,
} from "../types/expert-cancellation-report.types";

export function useAdminExpertCancellationStats(
  query: ExpertCancellationStatsQuery,
) {
  return useQuery({
    queryKey: queryKeys.expertCancellationStats("admin", query),
    queryFn: async () =>
      (await expertCancellationReportsApi.getAdminStats(query)).data,
  });
}

export function useClinicExpertCancellationStats(
  query: Pick<ExpertCancellationStatsQuery, "days">,
) {
  return useQuery({
    queryKey: queryKeys.expertCancellationStats("clinic", query),
    queryFn: async () =>
      (await expertCancellationReportsApi.getClinicStats(query)).data,
  });
}

export function useExpertCancellationPolicy() {
  return useQuery({
    queryKey: queryKeys.expertCancellationPolicy,
    queryFn: async () => (await expertCancellationReportsApi.getPolicy()).data,
    staleTime: 60 * 1000,
  });
}

export function useUpdateExpertCancellationPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExpertCancellationPolicyDto) =>
      expertCancellationReportsApi.updatePolicy(data).then((res) => res.data),
    onSuccess: (data) => {
      toast.success("Đã cập nhật chính sách hủy lịch thành công!");
      queryClient.setQueryData(queryKeys.expertCancellationPolicy, data);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.expertCancellationPolicy,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookingSettings,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.expertCancellationStats("admin"),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.expertCancellationStats("clinic"),
      });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể cập nhật chính sách hủy lịch.";
      toast.error(message);
    },
  });
}
