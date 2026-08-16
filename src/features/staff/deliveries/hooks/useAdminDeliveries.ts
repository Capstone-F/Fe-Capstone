import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deliveriesAdminApi,
  type ListDeliveriesQueryParams,
} from "../api/deliveries-admin.api";

export function useAdminDeliveries(params?: ListDeliveriesQueryParams) {
  return useQuery({
    queryKey: ["admin-deliveries", params],
    queryFn: async () => {
      const res = await deliveriesAdminApi.list(params);
      return res.data;
    },
    refetchInterval: 5000,
  });
}

export function useConfirmHandover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, note }: { orderId: string; note?: string }) =>
      deliveriesAdminApi.confirmHandover(orderId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    },
  });
}

export function useCreateGhnOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (deliveryId: string) =>
      deliveriesAdminApi.createGhnOrder(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    },
  });
}

export function useAdvanceDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      deliveryId,
      steps,
    }: {
      deliveryId: string;
      steps?: number;
    }) => deliveriesAdminApi.advance(deliveryId, steps),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    },
  });
}

export function useTickDeliverySimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ignoreDelay?: boolean) => deliveriesAdminApi.tick(ignoreDelay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    },
  });
}

export function useRetryFulfillment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      deliveriesAdminApi.retryFulfillment(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    },
  });
}
