import type { AxiosResponse } from "axios";

import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  BookingSettingsDto,
  UpdateBookingSettingsDto,
} from "../types/admin-booking-settings.types";

export const adminBookingSettingsApi = {
  get: (): Promise<AxiosResponse<BookingSettingsDto>> => {
    return apiClient.get<BookingSettingsDto>(
      API_ENDPOINTS.ADMIN_BOOKING_SETTINGS.GET,
    );
  },

  update: (
    data: UpdateBookingSettingsDto,
  ): Promise<AxiosResponse<BookingSettingsDto>> => {
    return apiClient.patch<BookingSettingsDto>(
      API_ENDPOINTS.ADMIN_BOOKING_SETTINGS.GET,
      data,
    );
  },
};
