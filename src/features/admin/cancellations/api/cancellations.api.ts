import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  OrderCancellation,
  PaginatedCancellationsResponse,
  ListCancellationsParams,
  ConfirmReturnDto,
  CancelOrderStaffDto,
  AdvanceCancellationDto,
} from "../types/cancellation.types";

export const cancellationsApi = {
  getCancellations: (
    params?: ListCancellationsParams,
  ): Promise<AxiosResponse<PaginatedCancellationsResponse>> => {
    const queryParams: Record<string, string> = {};
    if (params?.status && params.status !== "ALL") {
      queryParams.status = params.status;
    }
    if (params?.page) {
      queryParams.page = params.page.toString();
    }
    if (params?.limit) {
      queryParams.limit = params.limit.toString();
    }
    return apiClient.get<PaginatedCancellationsResponse>(
      API_ENDPOINTS.ADMIN_ORDER_CANCELLATIONS.LIST,
      { params: queryParams },
    );
  },

  getCancellationById: (
    id: string,
  ): Promise<AxiosResponse<OrderCancellation>> => {
    return apiClient.get<OrderCancellation>(
      API_ENDPOINTS.ADMIN_ORDER_CANCELLATIONS.DETAIL(id),
    );
  },

  confirmReturn: (
    id: string,
    body: ConfirmReturnDto,
  ): Promise<AxiosResponse<OrderCancellation>> => {
    return apiClient.post<OrderCancellation>(
      API_ENDPOINTS.ADMIN_ORDER_CANCELLATIONS.CONFIRM_RETURN(id),
      body,
    );
  },

  cancelOrder: (
    body: CancelOrderStaffDto,
  ): Promise<AxiosResponse<OrderCancellation>> => {
    return apiClient.post<OrderCancellation>(
      API_ENDPOINTS.ADMIN_ORDER_CANCELLATIONS.CANCEL,
      body,
    );
  },

  advanceCancellation: (
    id: string,
    body?: AdvanceCancellationDto,
  ): Promise<AxiosResponse<OrderCancellation>> => {
    return apiClient.post<OrderCancellation>(
      API_ENDPOINTS.ADMIN_ORDER_CANCELLATIONS.ADVANCE(id),
      body || { steps: 3 },
    );
  },

  tickBatch: (): Promise<AxiosResponse<{ processed: number }>> => {
    return apiClient.post<{ processed: number }>(
      API_ENDPOINTS.ADMIN_ORDER_CANCELLATIONS.TICK,
    );
  },

  getWalletDetail: (
    userId: string,
  ): Promise<
    AxiosResponse<{
      userId: string;
      balanceVnd: number;
      currency: string;
      status: string;
    }>
  > => {
    return apiClient.get(API_ENDPOINTS.ADMIN_WALLETS.DETAIL(userId));
  },
};
