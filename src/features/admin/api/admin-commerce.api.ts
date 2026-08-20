import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface ComboDiscountSettings {
  percent: number;
  minSubtotalVnd: number;
}

export interface WalletInspectionResponse {
  balance: number;
  heldBalance: number;
  currency: string;
  transactions?: {
    id: string;
    amount: number;
    type: string;
    description?: string;
    createdAt: string;
  }[];
}

export const adminCommerceApi = {
  getComboDiscount: (): Promise<AxiosResponse<ComboDiscountSettings>> => {
    return apiClient.get<ComboDiscountSettings>(
      API_ENDPOINTS.ADMIN_COMMERCE.COMBO_DISCOUNT,
    );
  },

  updateComboDiscount: (
    data: ComboDiscountSettings,
  ): Promise<AxiosResponse<ComboDiscountSettings>> => {
    return apiClient.put<ComboDiscountSettings>(
      API_ENDPOINTS.ADMIN_COMMERCE.COMBO_DISCOUNT,
      data,
    );
  },

  inspectWallet: (
    userId: string,
  ): Promise<AxiosResponse<WalletInspectionResponse>> => {
    return apiClient.get<WalletInspectionResponse>(
      API_ENDPOINTS.ADMIN_WALLETS.DETAIL(userId),
    );
  },

  topUpWallet: (
    userId: string,
    amountVnd: number,
  ): Promise<AxiosResponse<unknown>> => {
    return apiClient.post(API_ENDPOINTS.ADMIN_WALLETS.TOP_UP(userId), {
      amountVnd,
    });
  },
};
