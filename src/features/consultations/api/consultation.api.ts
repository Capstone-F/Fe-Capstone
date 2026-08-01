import type { AxiosResponse } from "axios";

import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  ChatTokenResponse,
  CustomerConsultationContext,
  VideoTokenResponse,
} from "../types/consultation.types";

export const consultationApi = {
  getVideoToken(bookingId: string): Promise<AxiosResponse<VideoTokenResponse>> {
    return apiClient.get(API_ENDPOINTS.CONSULTATIONS.VIDEO_TOKEN(bookingId));
  },

  getChatToken(bookingId: string): Promise<AxiosResponse<ChatTokenResponse>> {
    return apiClient.get(API_ENDPOINTS.CONSULTATIONS.CHAT_TOKEN(bookingId));
  },

  getCustomerContext(
    customerId: string,
    consultationId: string,
  ): Promise<AxiosResponse<CustomerConsultationContext>> {
    return apiClient.get(
      API_ENDPOINTS.CUSTOMERS.CONSULTATION_CONTEXT(customerId),
      { params: { consultationId } },
    );
  },
};
