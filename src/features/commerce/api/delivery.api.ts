import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type { ShippingAddressInput } from "../types/delivery";

/**
 * GHN master data is forwarded by the backend in the provider's own PascalCase wire
 * format — it is not normalised server-side. Mapping to the domain shape happens in
 * `mapper/delivery.ts`.
 */
export interface GhnProvinceDto {
  ProvinceID: number;
  ProvinceName: string;
}

export interface GhnDistrictDto {
  DistrictID: number;
  DistrictName: string;
  ProvinceID: number;
}

export interface GhnWardDto {
  WardCode: string;
  WardName: string;
  DistrictID: number;
}

export interface FeeQuoteResponse {
  shippingFeeVnd: number;
}

export interface DeliveryStatusEventDto {
  providerStatus: string;
  occurredAt: string;
}

export interface DeliveryResponse {
  id: string;
  orderId: string;
  status: string;
  type: string;
  providerOrderCode: string | null;
  shippingFeeVnd: number;
  expectedDeliveryTime: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  recipientName: string | null;
  streetAddress: string | null;
  statusEvents: DeliveryStatusEventDto[];
}

export const deliveryApi = {
  getProvinces: (): Promise<AxiosResponse<GhnProvinceDto[]>> => {
    return apiClient.get<GhnProvinceDto[]>(API_ENDPOINTS.DELIVERY.PROVINCES);
  },

  getDistricts: (
    provinceId: number,
  ): Promise<AxiosResponse<GhnDistrictDto[]>> => {
    return apiClient.get<GhnDistrictDto[]>(API_ENDPOINTS.DELIVERY.DISTRICTS, {
      params: { provinceId },
    });
  },

  getWards: (districtId: number): Promise<AxiosResponse<GhnWardDto[]>> => {
    return apiClient.get<GhnWardDto[]>(API_ENDPOINTS.DELIVERY.WARDS, {
      params: { districtId },
    });
  },

  /** Display estimate only — POST /orders re-quotes the fee server-side. */
  quoteFee: (
    shippingAddress: ShippingAddressInput,
  ): Promise<AxiosResponse<FeeQuoteResponse>> => {
    return apiClient.post<FeeQuoteResponse>(API_ENDPOINTS.DELIVERY.FEE_QUOTE, {
      shippingAddress,
    });
  },

  getByOrder: (orderId: string): Promise<AxiosResponse<DeliveryResponse>> => {
    return apiClient.get<DeliveryResponse>(
      API_ENDPOINTS.DELIVERY.BY_ORDER(orderId),
    );
  },
};
