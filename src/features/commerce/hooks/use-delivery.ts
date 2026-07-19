import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getDeliveryOptions } from "../api/delivery-client";

/** Priced shipping options for the checkout shipping step. */
export function useDeliveryOptions() {
  return useQuery({
    queryKey: queryKeys.deliveryOptions,
    queryFn: getDeliveryOptions,
  });
}
