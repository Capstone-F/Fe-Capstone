import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { deliveryApi } from "../api/delivery.api";
import type { DeliveryOption } from "@/types/domain";

/** Priced shipping options for the checkout shipping step. */
export function useDeliveryOptions() {
  return useQuery({
    queryKey: queryKeys.deliveryOptions,
    queryFn: async (): Promise<DeliveryOption[]> => {
      const response = await deliveryApi.getDeliveryOptions();
      return response.data.map((opt) => ({
        providerId: opt.providerId,
        providerCode: opt.providerCode,
        providerName: opt.providerName,
        type: opt.type as DeliveryOption["type"],
        feeVnd: opt.feeVnd,
      }));
    },
  });
}
