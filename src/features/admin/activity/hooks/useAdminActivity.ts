import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { adminActivityApi } from "../api/admin-activity.api";
import type { ListAdminActivityQuery } from "../types/activity.types";

export function useAdminActivity(query: ListAdminActivityQuery) {
  return useQuery({
    queryKey: queryKeys.adminActivity(query),
    queryFn: () => adminActivityApi.list(query).then((res) => res.data),
  });
}
