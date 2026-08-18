import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
    // Keeps the previous page's rows on screen while a new page or search
    // fetches, so `items` never goes transiently empty — which would otherwise
    // make the deselect logic drop a still-valid selection mid-search.
    placeholderData: keepPreviousData,
  });
}
