import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface OrderItemResponse {
  id: string;
  productVariantId: string;
  quantity: number;
  unitPriceVnd: number;
  lineTotalVnd: number;
  surveyRecommendationItemId: string | null;
}

export interface OrderResponse {
  id: string;
  status: string;
  source: string;
  customerSurveyId: string | null;
  surveyRecommendationId: string | null;
  subtotalVnd: number;
  discountVnd: number;
  discountType: string | null;
  shippingFeeVnd: number;
  totalVnd: number;
  items: OrderItemResponse[];
  createdAt: string;
}

export interface PaginatedOrdersResponse {
  items: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ListOrdersQuery {
  status?: string;
  page?: number;
  limit?: number;
}

export const ordersApi = {
  createOrder: (): Promise<AxiosResponse<OrderResponse>> => {
    return apiClient.post<OrderResponse>(API_ENDPOINTS.ORDERS.CREATE);
  },

  getOrder: (id: string): Promise<AxiosResponse<OrderResponse>> => {
    return apiClient.get<OrderResponse>(API_ENDPOINTS.ORDERS.DETAIL(id));
  },

  getOrders: (
    query?: ListOrdersQuery,
  ): Promise<AxiosResponse<PaginatedOrdersResponse>> => {
    return apiClient.get<PaginatedOrdersResponse>(API_ENDPOINTS.ORDERS.LIST, {
      params: {
        status: query?.status,
        page: query?.page ?? 1,
        limit: query?.limit ?? 10,
      },
    });
  },
};
