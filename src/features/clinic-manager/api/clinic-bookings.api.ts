import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export type EscrowStatus = "HELD" | "RELEASED" | "REFUNDED";

export interface ClinicBookingItem {
  id: string;
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  escrowStatus: EscrowStatus | null;
  expertId: string;
  expertName?: string;
  customerName?: string;
  scheduledAt: string;
  feeChargedVnd: number | string;
  isPaid: boolean;
  notes?: string | null;
  feedback?: {
    rating: number;
    comment: string;
  } | null;
  createdAt: string;
}

export interface PaginatedClinicBookingsResponse {
  items: ClinicBookingItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ListClinicBookingsQuery {
  search?: string;
  expertId?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export const clinicBookingsApi = {
  getClinicBookings: (
    query?: ListClinicBookingsQuery,
  ): Promise<AxiosResponse<PaginatedClinicBookingsResponse>> => {
    return apiClient.get<PaginatedClinicBookingsResponse>(
      API_ENDPOINTS.CLINIC.BOOKINGS,
      {
        params: {
          search: query?.search || undefined,
          expertId: query?.expertId || undefined,
          status: query?.status || undefined,
          from: query?.from || undefined,
          to: query?.to || undefined,
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      },
    );
  },

  getClinicBookingDetail: (
    id: string,
  ): Promise<AxiosResponse<ClinicBookingItem>> => {
    return apiClient.get<ClinicBookingItem>(
      API_ENDPOINTS.CLINIC.BOOKING_DETAIL(id),
    );
  },
};
