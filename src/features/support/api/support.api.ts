import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { ApiError } from "@/core/api/errors";
import {
  CloseSupportSessionDto,
  CreateSupportSessionDto,
  ListSupportSessionsQueryDto,
  MarkSupportReadDto,
  PaginatedSupportSessionsDto,
  SendSupportMessageDto,
  SupportMessageResponseDto,
  SupportMessagesPageDto,
  SupportSessionResponseDto,
} from "../types/support.types";

export const supportApi = {
  getMyLiveSession: async (): Promise<SupportSessionResponseDto | null> => {
    try {
      const response = await apiClient.get<SupportSessionResponseDto>(
        API_ENDPOINTS.SUPPORT.LIVE_SESSION,
      );
      return response.data;
    } catch (error: unknown) {
      // The API client normalizes Axios failures to ApiError, so a missing live
      // session is represented by `error.status` rather than `error.response`.
      // A 404 is the expected "no active session" state for customers.
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  createSession: async (
    dto: CreateSupportSessionDto,
  ): Promise<SupportSessionResponseDto> => {
    const response = await apiClient.post<SupportSessionResponseDto>(
      API_ENDPOINTS.SUPPORT.SESSIONS,
      dto,
    );
    return response.data;
  },

  listSessions: async (params?: ListSupportSessionsQueryDto) => {
    const response = await apiClient.get<PaginatedSupportSessionsDto>(
      API_ENDPOINTS.SUPPORT.SESSIONS,
      { params },
    );
    return response.data;
  },

  getSession: async (id: string) => {
    const response = await apiClient.get<SupportSessionResponseDto>(
      API_ENDPOINTS.SUPPORT.SESSION_DETAIL(id),
    );
    return response.data;
  },

  claimSession: async (id: string) => {
    const response = await apiClient.post<SupportSessionResponseDto>(
      API_ENDPOINTS.SUPPORT.CLAIM_SESSION(id),
    );
    return response.data;
  },

  getMessages: async (id: string, afterSeq = 0, limit = 50) => {
    const response = await apiClient.get<SupportMessagesPageDto>(
      API_ENDPOINTS.SUPPORT.SESSION_MESSAGES(id),
      { params: { afterSeq, limit } },
    );
    return response.data;
  },

  sendMessage: async (id: string, data: SendSupportMessageDto) => {
    const response = await apiClient.post<SupportMessageResponseDto>(
      API_ENDPOINTS.SUPPORT.SESSION_MESSAGES(id),
      data,
    );
    return response.data;
  },

  markRead: async (id: string, data: MarkSupportReadDto) => {
    const response = await apiClient.post(
      API_ENDPOINTS.SUPPORT.READ_SESSION(id),
      data,
    );
    return response.data;
  },

  closeSession: async (id: string, data?: CloseSupportSessionDto) => {
    const response = await apiClient.post<SupportSessionResponseDto>(
      API_ENDPOINTS.SUPPORT.CLOSE_SESSION(id),
      data,
    );
    return response.data;
  },
};
