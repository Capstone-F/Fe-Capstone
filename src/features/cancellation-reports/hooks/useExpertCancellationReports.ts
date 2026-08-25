"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { expertCancellationReportsApi } from "../api/expert-cancellation-reports.api";
import type { ExpertCancellationStatsQuery } from "../types/expert-cancellation-report.types";

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
