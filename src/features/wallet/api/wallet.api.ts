import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type { Wallet, WalletTransaction } from "../types/wallet.types";

export const walletApi = {
  getWallet: async (): Promise<AxiosResponse<Wallet>> => {
    return apiClient.get<Wallet>(API_ENDPOINTS.WALLET.ME);
  },

  getTransactions: async (): Promise<AxiosResponse<WalletTransaction[]>> => {
    return apiClient.get<WalletTransaction[]>(
      API_ENDPOINTS.WALLET.TRANSACTIONS,
    );
  },

  topUp: async (amountVnd: number): Promise<AxiosResponse<Wallet>> => {
    return apiClient.post<Wallet>(API_ENDPOINTS.WALLET.TOP_UP, { amountVnd });
  },

  payConsultation: async (
    consultationId: string,
  ): Promise<AxiosResponse<Wallet>> => {
    return apiClient.post<Wallet>(API_ENDPOINTS.BOOKINGS.PAY(consultationId));
  },
};
