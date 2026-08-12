"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { ApiError } from "@/core/api/errors";
import { useSession } from "@/features/auth/hooks/useSession";
import { deliveryApi } from "../api/delivery.api";
import { toDelivery, toDistrict, toProvince, toWard } from "../mapper/delivery";
import type {
  Delivery,
  District,
  Province,
  ShippingAddressInput,
  Ward,
} from "../types/delivery";

/** GHN administrative units barely change and the backend does not cache them. */
const MASTER_DATA_STALE_TIME = 24 * 60 * 60 * 1000;
const FEE_QUOTE_STALE_TIME = 5 * 60 * 1000;
/** The GHN order code lands seconds after the payment IPN; poll only until it does. */
const DELIVERY_POLL_INTERVAL = 5000;

export function useProvinces() {
  const session = useSession();

  return useQuery({
    queryKey: queryKeys.provinces,
    queryFn: async (): Promise<Province[]> => {
      const response = await deliveryApi.getProvinces();
      return response.data.map(toProvince);
    },
    enabled: !session.isLoading && Boolean(session.data),
    staleTime: MASTER_DATA_STALE_TIME,
  });
}

export function useDistricts(provinceId: number | null) {
  const session = useSession();

  return useQuery({
    queryKey: queryKeys.districts(provinceId),
    queryFn: async (): Promise<District[]> => {
      const response = await deliveryApi.getDistricts(provinceId as number);
      return response.data.map(toDistrict);
    },
    enabled: !session.isLoading && Boolean(session.data) && provinceId !== null,
    staleTime: MASTER_DATA_STALE_TIME,
  });
}

export function useWards(districtId: number | null) {
  const session = useSession();

  return useQuery({
    queryKey: queryKeys.wards(districtId),
    queryFn: async (): Promise<Ward[]> => {
      const response = await deliveryApi.getWards(districtId as number);
      return response.data.map(toWard);
    },
    enabled: !session.isLoading && Boolean(session.data) && districtId !== null,
    staleTime: MASTER_DATA_STALE_TIME,
  });
}

/**
 * Preview of the GHN fee for the current cart. A display estimate only: POST /orders
 * re-quotes server-side, so a failure here must not block checkout.
 *
 * The whole address goes in the request body because that is what the endpoint accepts,
 * but the quote only varies by district + ward (the backend prices from those plus the
 * server-side cart weight). Keying on the full address would refetch an identical quote
 * on every keystroke in the recipient and street inputs.
 */
export function useShippingFeeQuote(address: ShippingAddressInput | null) {
  return useQuery({
    queryKey: queryKeys.shippingFeeQuote(
      address?.districtId ?? null,
      address?.wardCode ?? null,
    ),
    queryFn: async (): Promise<number> => {
      const response = await deliveryApi.quoteFee(
        address as ShippingAddressInput,
      );
      return response.data.shippingFeeVnd;
    },
    enabled: address !== null,
    staleTime: FEE_QUOTE_STALE_TIME,
    placeholderData: (previousData) => previousData,
    retry: false,
  });
}

/** Delivery + tracking history for one order. 404 means the order predates GHN. */
export function useOrderDelivery(orderId: string): {
  delivery: Delivery | undefined;
  isLoading: boolean;
  isNotFound: boolean;
} {
  const query = useQuery({
    queryKey: queryKeys.orderDelivery(orderId),
    queryFn: async (): Promise<Delivery> => {
      const response = await deliveryApi.getByOrder(orderId);
      return toDelivery(response.data);
    },
    enabled: Boolean(orderId),
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 404
        ? false
        : failureCount < 3,
    refetchInterval: (query) =>
      query.state.data?.providerOrderCode === null
        ? DELIVERY_POLL_INTERVAL
        : false,
  });

  return {
    delivery: query.data,
    isLoading: query.isLoading,
    isNotFound: query.error instanceof ApiError && query.error.status === 404,
  };
}
