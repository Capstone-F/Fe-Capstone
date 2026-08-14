import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { walletApi } from "../api/wallet.api";
import type {
  UseWalletOptions,
  WalletTopUpRequest,
  WalletTransactionsParams,
} from "../types/wallet.types";

export function useWallet(options: UseWalletOptions = {}) {
  return useQuery({
    queryKey: queryKeys.wallet,
    queryFn: () => walletApi.getWallet().then((res) => res.data),
    // Guests have no wallet: callers on pages that also serve logged-out visitors
    // must gate this, otherwise the 401 kicks off a pointless refresh round-trip.
    enabled: options.enabled ?? true,
  });
}

export function useWalletTransactions(params?: WalletTransactionsParams) {
  return useQuery({
    queryKey: queryKeys.walletTransactions(params),
    queryFn: () =>
      walletApi.getTransactions(params).then((res) => res.data.items),
  });
}

/**
 * Starts a top-up. The wallet is not credited here: the response is a gateway URL the
 * caller redirects to, and the balance only moves once the gateway calls back — so
 * there is deliberately no cache invalidation on success.
 */
export function useTopUpWallet() {
  return useMutation({
    mutationFn: (payload: WalletTopUpRequest) =>
      walletApi.topUp(payload).then((res) => res.data),
  });
}
