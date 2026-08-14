import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { PaginatedResponse } from "@/core/api/types";
import type { AxiosResponse } from "axios";
import type {
  Wallet,
  WalletTopUpRequest,
  WalletTopUpResponse,
  WalletTransaction,
  WalletTransactionsParams,
} from "../types/wallet.types";

export const walletApi = {
  getWallet: (): Promise<AxiosResponse<Wallet>> => {
    return apiClient.get<Wallet>(API_ENDPOINTS.WALLET.ME);
  },

  /** Wallet ledger, newest first. The backend resolves `direction` per row. */
  getTransactions: (
    params?: WalletTransactionsParams,
  ): Promise<AxiosResponse<PaginatedResponse<WalletTransaction>>> => {
    return apiClient.get<PaginatedResponse<WalletTransaction>>(
      API_ENDPOINTS.WALLET.TRANSACTIONS,
      { params },
    );
  },

  /** Returns a gateway URL to redirect to — the balance only moves after the gateway callback. */
  topUp: (
    payload: WalletTopUpRequest,
  ): Promise<AxiosResponse<WalletTopUpResponse>> => {
    return apiClient.post<WalletTopUpResponse>(
      API_ENDPOINTS.WALLET.TOP_UP,
      payload,
    );
  },
};
