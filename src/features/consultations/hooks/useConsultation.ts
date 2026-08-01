import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { consultationApi } from "../api/consultation.api";

export function useCustomerConsultationContext(
  customerId: string,
  consultationId: string,
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.consultationContext(customerId, consultationId),
    queryFn: async () =>
      (await consultationApi.getCustomerContext(customerId, consultationId))
        .data,
    enabled: enabled && Boolean(customerId) && Boolean(consultationId),
  });
}
