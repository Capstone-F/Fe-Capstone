import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  adminFinanceApi,
  type ListClinicBalancesQuery,
} from "../api/admin-finance.api";

export function useClinicBalances(query: ListClinicBalancesQuery = {}) {
  return useQuery({
    queryKey: queryKeys.adminClinicBalances(query),
    queryFn: () =>
      adminFinanceApi.getClinicBalances(query).then((res) => res.data),
  });
}
