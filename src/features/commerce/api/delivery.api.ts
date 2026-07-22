import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface DeliveryOptionResponse {
  providerId: string;
  providerCode: string;
  providerName: string;
  type: string;
  feeVnd: number;
}

export interface OrderResponse {
  id: string;
  status: string;
  source: string;
  subtotalVnd: number;
  discountVnd: number;
  discountType: string | null;
  shippingFeeVnd: number;
  totalVnd: number;
  items: {
    id: string;
    productVariantId: string;
    quantity: number;
    unitPriceVnd: number;
    lineTotalVnd: number;
  }[];
  createdAt: string;
}

export interface AttachDeliveryInput {
  providerId: string;
  type: string;
  shippingAddress: string;
}

export const deliveryApi = {
  getDeliveryOptions: (): Promise<AxiosResponse<DeliveryOptionResponse[]>> => {
    return apiClient.get<DeliveryOptionResponse[]>(
      API_ENDPOINTS.DELIVERY.OPTIONS,
    );
  },

  attachDelivery: (
    orderId: string,
    input: AttachDeliveryInput,
  ): Promise<AxiosResponse<OrderResponse>> => {
    return apiClient.post<OrderResponse>(
      API_ENDPOINTS.DELIVERY.ATTACH(orderId),
      input,
    );
  },
};
