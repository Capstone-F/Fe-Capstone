import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { CartResponse } from "../types/cart.types";
import type { OrderSource } from "@/types/domain";
import type { AxiosResponse } from "axios";

export const cartApi = {
  getCart: (): Promise<AxiosResponse<CartResponse>> => {
    return apiClient.get<CartResponse>(API_ENDPOINTS.CART.GET);
  },

  addToCart: (
    productVariantId: string,
    quantity: number,
    source: OrderSource,
    surveyRecommendationId?: string,
    treatmentPhaseId?: string,
  ): Promise<AxiosResponse<CartResponse>> => {
    return apiClient.post<CartResponse>(API_ENDPOINTS.CART.ITEMS, {
      productVariantId,
      quantity,
      source,
      ...(surveyRecommendationId ? { surveyRecommendationId } : {}),
      ...(treatmentPhaseId ? { treatmentPhaseId } : {}),
    });
  },

  removeFromCart: (
    productVariantId: string,
  ): Promise<AxiosResponse<CartResponse>> => {
    return apiClient.delete<CartResponse>(
      API_ENDPOINTS.CART.ITEM(productVariantId),
    );
  },

  clearCart: (): Promise<AxiosResponse<void>> => {
    return apiClient.delete<void>(API_ENDPOINTS.CART.GET);
  },
};
