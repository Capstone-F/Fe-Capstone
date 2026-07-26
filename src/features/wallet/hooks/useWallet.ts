import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "../api/wallet.api";

export function useWallet() {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: async () => {
      const response = await walletApi.getWallet();
      return response.data;
    },
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const response = await walletApi.getTransactions();
      return response.data;
    },
  });
}

export function useTopUpWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amountVnd: number) => {
      const response = await walletApi.topUp(amountVnd);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}

export function usePayConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      consultationId,
      amountVnd,
    }: {
      consultationId: string;
      amountVnd: number;
    }) => {
      const response = await walletApi.payConsultation(
        consultationId,
        amountVnd,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
