import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export interface DeliveryStatusEvent {
  providerStatus: string;
  deliveryStatus?: string | null;
  occurredAt: string;
}

export interface DeliveryItem {
  id: string;
  orderId: string;
  provider: string;
  providerOrderCode?: string | null;
  status: string;
  providerStatus?: string | null;
  handedOverAt?: string | null;
  handedOverByUserId?: string | null;
  handoverNote?: string | null;
  recipientName?: string | null;
  streetAddress?: string | null;
  shippingFeeVnd?: number;
  statusEvents?: DeliveryStatusEvent[];
  createdAt: string;
  updatedAt: string;
  stockShortfall?: boolean;
  order?: {
    id: string;
    code?: string;
    status: string;
    totalAmountVnd: number;
    shippingAddress?: Record<string, unknown>;
    stockShortfall?: boolean;
  };
}

export interface PaginatedDeliveriesResponse {
  items: DeliveryItem[];
  total: number;
}

export interface ListDeliveriesQueryParams {
  status?: string;
  orderId?: string;
  missingProviderCode?: boolean;
  awaitingHandover?: boolean;
  page?: number;
  limit?: number;
}

export const deliveriesAdminApi = {
  list: (
    params?: ListDeliveriesQueryParams,
  ): Promise<AxiosResponse<PaginatedDeliveriesResponse>> => {
    return apiClient.get<PaginatedDeliveriesResponse>(
      API_ENDPOINTS.ADMIN_DELIVERIES.LIST,
      {
        params,
      },
    );
  },

  getById: (id: string): Promise<AxiosResponse<DeliveryItem>> => {
    return apiClient.get<DeliveryItem>(
      API_ENDPOINTS.ADMIN_DELIVERIES.DETAIL(id),
    );
  },

  confirmHandover: (
    orderId: string,
    note?: string,
  ): Promise<AxiosResponse<DeliveryItem>> => {
    return apiClient.post<DeliveryItem>(
      API_ENDPOINTS.ADMIN_ORDERS.HANDOVER(orderId),
      {
        note,
      },
    );
  },

  retryFulfillment: (orderId: string): Promise<AxiosResponse<unknown>> => {
    return apiClient.post<unknown>(
      API_ENDPOINTS.ADMIN_ORDERS.RETRY_FULFILLMENT(orderId),
    );
  },

  createGhnOrder: (
    deliveryId: string,
  ): Promise<AxiosResponse<{ delivery: DeliveryItem; created: boolean }>> => {
    return apiClient.post<{ delivery: DeliveryItem; created: boolean }>(
      API_ENDPOINTS.ADMIN_DELIVERIES.CREATE_GHN_ORDER(deliveryId),
    );
  },

  advance: (
    deliveryId: string,
    steps: number = 10,
  ): Promise<
    AxiosResponse<{ delivery: DeliveryItem; transitions: number }>
  > => {
    return apiClient.post<{ delivery: DeliveryItem; transitions: number }>(
      API_ENDPOINTS.ADMIN_DELIVERIES.ADVANCE(deliveryId),
      { steps },
    );
  },

  tick: (
    ignoreDelay: boolean = true,
  ): Promise<AxiosResponse<{ processed: number; advanced: number }>> => {
    return apiClient.post<{ processed: number; advanced: number }>(
      API_ENDPOINTS.ADMIN_DELIVERIES.TICK,
      { ignoreDelay },
    );
  },

  forceStatus: (
    deliveryId: string,
    providerStatus: string,
    note?: string,
  ): Promise<
    AxiosResponse<{
      delivery: DeliveryItem;
      applied: boolean;
      deliveryStatus: string;
    }>
  > => {
    return apiClient.post<{
      delivery: DeliveryItem;
      applied: boolean;
      deliveryStatus: string;
    }>(API_ENDPOINTS.ADMIN_DELIVERIES.FORCE_STATUS(deliveryId), {
      providerStatus,
      note,
    });
  },
};
