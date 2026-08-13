import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardRange } from "../types/dashboard.types";

export function useAdminDashboard(range: DashboardRange) {
  return useQuery({
    queryKey: queryKeys.dashboard("admin", range),
    queryFn: () => dashboardApi.getAdmin(range),
  });
}

export function useExpertDashboard(range: DashboardRange) {
  return useQuery({
    queryKey: queryKeys.dashboard("expert", range),
    queryFn: () => dashboardApi.getExpert(range),
  });
}

export function useStaffDashboard(range: DashboardRange) {
  return useQuery({
    queryKey: queryKeys.dashboard("staff", range),
    queryFn: () => dashboardApi.getStaff(range),
    refetchInterval: 15_000,
  });
}
