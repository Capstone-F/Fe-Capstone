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
    range: "week" | "month" = "week",
  ): Promise<AxiosResponse<BackendSlotsResponse>> => {
    return apiClient.get<BackendSlotsResponse>(
      API_ENDPOINTS.BOOKINGS.SLOTS(expertId),
      {
        params: {
          date,
          range,
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

  getBookingById: (id: string): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.get<BackendBooking>(API_ENDPOINTS.BOOKINGS.DETAIL(id));
  },

  payBooking: (id: string): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.post<BackendBooking>(API_ENDPOINTS.BOOKINGS.PAY(id));
  },

  getExpertBookings: (params?: {
    tab?: "upcoming" | "past" | "cancelled";
    status?: string;
  }): Promise<AxiosResponse<BackendBookingsResponse>> => {
    return apiClient.get<BackendBookingsResponse>(API_ENDPOINTS.BOOKINGS.ME, {
      params: {
        as: "expert",
        ...params,
      },
    });
  },

  confirmBooking: (id: string): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.patch<BackendBooking>(API_ENDPOINTS.BOOKINGS.CONFIRM(id));
  },

  cancelBooking: (
    id: string,
    reason?: string,
  ): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.patch<BackendBooking>(API_ENDPOINTS.BOOKINGS.CANCEL(id), {
      reason,
    });
  },

  startBooking: (id: string): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.patch<BackendBooking>(API_ENDPOINTS.BOOKINGS.START(id));
  },

  completeBooking: (id: string): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.patch<BackendBooking>(API_ENDPOINTS.BOOKINGS.COMPLETE(id));
  },

  submitFeedback: (
    id: string,
    rating: number,
    comment?: string,
  ): Promise<AxiosResponse<BackendBooking>> => {
    return apiClient.post<BackendBooking>(API_ENDPOINTS.BOOKINGS.FEEDBACK(id), {
      rating,
      comment,
    });
  },
};
