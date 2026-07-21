"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { ApiError } from "@/lib/api/client";
import { Order } from "@/types/domain";
import { useSession } from "@/features/auth/hooks/use-session";
import { getAllProducts } from "../api/products-client";
import { getOrder, getOrders, ListOrdersQuery } from "../api/orders-client";
import { indexProductVariants } from "../mapper/cart-hydration";
import { hydrateOrderItems, HydratedOrderItem } from "../lib/order-hydration";

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
    queryFn: () => getOrders(query),
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
    queryFn: () => getOrder(id),
    enabled: isAuthenticated && Boolean(id),
    // A 404 means the id is wrong or belongs to someone else. Retrying cannot
    // change that, and the page renders a not-found state for it.
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
