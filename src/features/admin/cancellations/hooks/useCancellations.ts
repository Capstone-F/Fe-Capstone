import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cancellationsApi } from "../api/cancellations.api";
import type {
  ListCancellationsParams,
  ConfirmReturnDto,
  CancelOrderStaffDto,
} from "../types/cancellation.types";

export function useOrderCancellations(
  params?: ListCancellationsParams,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["order-cancellations", params],
    queryFn: async () => {
      const res = await cancellationsApi.getCancellations(params);
      return res.data;
    },
    enabled,
    refetchInterval: 10_000,
  });
}

export function useOrderCancellationDetail(
  id: string,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["order-cancellation-detail", id],
    queryFn: async () => {
      const res = await cancellationsApi.getCancellationById(id);
      return res.data;
    },
    enabled: Boolean(id) && enabled,
  });
}

export function useConfirmReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ConfirmReturnDto }) =>
      cancellationsApi.confirmReturn(id, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order-cancellations"] });
      queryClient.invalidateQueries({
        queryKey: ["order-cancellation-detail", variables.id],
      });
    },
  });
}

export function useCancelOrderStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CancelOrderStaffDto) =>
      cancellationsApi.cancelOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-cancellations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-deliveries"] });
    },
  });
}

export function useTickCancellationBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cancellationsApi.tickBatch(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-cancellations"] });
    },
  });
}

export function useAdminWalletInspector(
  userId: string,
  enabled: boolean = false,
) {
  return useQuery({
    queryKey: ["admin-wallet", userId],
    queryFn: async () => {
      const res = await cancellationsApi.getWalletDetail(userId);
      return res.data;
    },
    enabled: Boolean(userId) && enabled,
  });
}
