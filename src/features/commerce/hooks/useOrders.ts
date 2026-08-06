"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { ApiError } from "@/core/api/errors";
import type { Order } from "@/types/domain";
import { useSession } from "@/features/auth/hooks/useSession";
import { getAllProducts } from "./useCart";
import {
  ordersApi,
  type OrderResponse,
  type ListOrdersQuery,
} from "../api/orders.api";
import { indexProductVariants } from "../mapper/cart-hydration";
import {
  hydrateOrderItems,
  type HydratedOrderItem,
} from "../lib/order-hydration";

function toOrder(response: OrderResponse): Order {
  return {
    id: response.id,
    status: response.status as Order["status"],
    source: response.source as Order["source"],
    subtotalVnd: response.subtotalVnd,
    discountVnd: response.discountVnd,
    discountType: response.discountType,
    shippingFeeVnd: response.shippingFeeVnd,
    totalVnd: response.totalVnd,
    items: response.items.map((item) => ({
      id: item.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPriceVnd: item.unitPriceVnd,
      lineTotalVnd: item.lineTotalVnd,
    })),
    createdAt: response.createdAt,
  };
}

/** An order plus its display-hydrated lines. */
export interface HydratedOrder {
  order: Order;
  items: HydratedOrderItem[];
}

export function useOrders(query: ListOrdersQuery): {
  orders: HydratedOrder[];
  total: number;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: unknown;
} {
  const session = useSession();
  const isAuthenticated = Boolean(session.data);

  // GET /orders is customer-scoped and 401s without a session. Gate the fetch
  // so a logged-out visitor sees the login prompt instead of a console error.
  const ordersQuery = useQuery({
    queryKey: queryKeys.orders(query),
    queryFn: async () => {
      const response = await ordersApi.getOrders(query);
      return {
        orders: response.data.items.map(toOrder),
        total: response.data.total,
      };
    },
    enabled: isAuthenticated,
  });

  const poolQuery = useQuery({
    queryKey: queryKeys.productPool,
    queryFn: getAllProducts,
    staleTime: 60_000,
    enabled: isAuthenticated,
  });

  const index = poolQuery.data ? indexProductVariants(poolQuery.data) : null;

  const orders =
    ordersQuery.data && index
      ? ordersQuery.data.orders.map((order) => ({
          order,
          items: hydrateOrderItems(order.items, index),
        }))
      : [];

  return {
    orders,
    total: ordersQuery.data?.total ?? 0,
    isLoading:
      session.isLoading ||
      (isAuthenticated && (ordersQuery.isLoading || poolQuery.isLoading)),
    isAuthenticated,
    error: ordersQuery.error ?? poolQuery.error,
  };
}

export function useOrder(id: string): {
  order: Order | undefined;
  items: HydratedOrderItem[];
  isLoading: boolean;
  isNotFound: boolean;
  error: unknown;
} {
  const session = useSession();
  const isAuthenticated = Boolean(session.data);

  const orderQuery = useQuery({
    queryKey: queryKeys.order(id),
    queryFn: async () => {
      const response = await ordersApi.getOrder(id);
      return toOrder(response.data);
    },
    enabled: isAuthenticated && Boolean(id),
    retry: (failureCount, error) =>
      error instanceof ApiError && error.status === 404
        ? false
        : failureCount < 3,
  });

  const poolQuery = useQuery({
    queryKey: queryKeys.productPool,
    queryFn: getAllProducts,
    staleTime: 60_000,
    enabled: isAuthenticated,
  });

  const items =
    orderQuery.data && poolQuery.data
      ? hydrateOrderItems(
          orderQuery.data.items,
          indexProductVariants(poolQuery.data),
        )
      : [];

  return {
    order: orderQuery.data,
    items,
    isLoading:
      session.isLoading ||
      (isAuthenticated && (orderQuery.isLoading || poolQuery.isLoading)),
    isNotFound:
      orderQuery.error instanceof ApiError && orderQuery.error.status === 404,
    error: orderQuery.error ?? poolQuery.error,
  };
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ordersApi.cancelOrder(id, reason).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}

export function useReorder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.reorder(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}
