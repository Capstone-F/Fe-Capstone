import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { consultationApi } from "../api/consultation.api";

export function useCustomerConsultationContext(
  customerId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.consultationContext(customerId),
    queryFn: async () =>
      (await consultationApi.getCustomerContext(customerId)).data,
    enabled: enabled && Boolean(customerId),
  });
}
