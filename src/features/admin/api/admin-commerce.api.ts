import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export type ComboDiscountKind = "survey" | "treatment";

export interface ComboDiscountSettings {
  percent: number;
  minSubtotalVnd: number;
}

const COMBO_DISCOUNT_ENDPOINTS: Record<ComboDiscountKind, string> = {
  survey: API_ENDPOINTS.ADMIN_COMMERCE.SURVEY_COMBO_DISCOUNT,
  treatment: API_ENDPOINTS.ADMIN_COMMERCE.TREATMENT_COMBO_DISCOUNT,
};

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
  getComboDiscount: (
    kind: ComboDiscountKind,
  ): Promise<AxiosResponse<ComboDiscountSettings>> => {
    return apiClient.get<ComboDiscountSettings>(COMBO_DISCOUNT_ENDPOINTS[kind]);
  },

  updateComboDiscount: (
    kind: ComboDiscountKind,
    data: ComboDiscountSettings,
  ): Promise<AxiosResponse<ComboDiscountSettings>> => {
    return apiClient.put<ComboDiscountSettings>(
      COMBO_DISCOUNT_ENDPOINTS[kind],
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
