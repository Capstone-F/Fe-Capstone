import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  BackendBooking,
  BackendBookingsResponse,
  BackendSlotsResponse,
} from "../types/booking.types";

export const bookingApi = {
  getSlots: (
    expertId: string,
    date: string,
  ): Promise<AxiosResponse<BackendSlotsResponse>> => {
    return apiClient.get<BackendSlotsResponse>(
      API_ENDPOINTS.BOOKINGS.SLOTS(expertId),
      {
        params: {
          date,
          range: "week",
        },
      },
    );
  },

  createBooking: (payload: {
    expertId: string;
    scheduledAt: string;
    reason: string;
  }): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.post<BackendBooking>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      payload,
    );
  },

  getBookings: (): Promise<AxiosResponse<BackendBookingsResponse>> => {
    return apiClient.get<BackendBookingsResponse>(API_ENDPOINTS.BOOKINGS.ME, {
      params: {
        as: "customer",
      },
    });
  },
};
