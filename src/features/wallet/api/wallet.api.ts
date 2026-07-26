import { apiClient } from "@/core/api/client";
import type { AxiosResponse } from "axios";
import type { Wallet, WalletTransaction } from "../types/wallet.types";
import { walletMock } from "./wallet.mock";
import { appConfig } from "@/lib/env";

export const walletApi = {
  getWallet: async (): Promise<AxiosResponse<Wallet>> => {
    if (appConfig.useMockApi) {
      const data = await walletMock.getWallet();
      return { data } as AxiosResponse<Wallet>;
    }
    return apiClient.get<Wallet>("/wallets/me");
  },

  getTransactions: async (): Promise<AxiosResponse<WalletTransaction[]>> => {
    if (appConfig.useMockApi) {
      const data = await walletMock.getTransactions();
      return { data } as AxiosResponse<WalletTransaction[]>;
    }
    return apiClient.get<WalletTransaction[]>("/wallets/me/transactions");
  },

  topUp: async (amountVnd: number): Promise<AxiosResponse<Wallet>> => {
    if (appConfig.useMockApi) {
      const data = await walletMock.topUp(amountVnd);
      return { data } as AxiosResponse<Wallet>;
    }
    return apiClient.post<Wallet>("/wallets/top-up", { amountVnd });
  },

  payConsultation: async (
    consultationId: string,
    amountVnd: number,
  ): Promise<AxiosResponse<Wallet>> => {
    if (appConfig.useMockApi) {
      const data = await walletMock.payConsultation(consultationId, amountVnd);
      return { data } as AxiosResponse<Wallet>;
    }
    return apiClient.post<Wallet>(`/bookings/${consultationId}/pay`, {
      amountVnd,
    });
  },
};
