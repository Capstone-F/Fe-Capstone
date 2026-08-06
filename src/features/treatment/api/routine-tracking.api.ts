import type { AxiosResponse } from "axios";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  CheckInResponseDto,
  HistoryDayDetailResponseDto,
  TodayRoutineDto,
  TodayRoutinesResponseDto,
} from "../types/routine-tracking.dto";
import type {
  CreateCheckInPayload,
  DateRangeQuery,
  RoutineHistoryResponse,
  RoutinePeriod,
  SkipStepPayload,
} from "../types/routine-tracking.types";

// Dumb transport layer: returns backend DTOs untouched. Mapping to the domain model
// happens in hooks/useRoutineTracking.ts via mapper/routine-tracking.mapper.ts.
export const routineTrackingApi = {
  getToday: (
    period?: RoutinePeriod,
  ): Promise<AxiosResponse<TodayRoutinesResponseDto>> =>
    apiClient.get<TodayRoutinesResponseDto>(API_ENDPOINTS.ROUTINES.TODAY, {
      params: period ? { period } : undefined,
    }),

  completeStep: (
    routineId: string,
    stepId: string,
  ): Promise<AxiosResponse<TodayRoutineDto>> =>
    apiClient.post<TodayRoutineDto>(
      API_ENDPOINTS.ROUTINES.STEP_COMPLETE(routineId, stepId),
    ),

  skipStep: (
    routineId: string,
    stepId: string,
    payload: SkipStepPayload,
  ): Promise<AxiosResponse<TodayRoutineDto>> =>
    apiClient.post<TodayRoutineDto>(
      API_ENDPOINTS.ROUTINES.STEP_SKIP(routineId, stepId),
      payload,
    ),

  createCheckIn: (
    routineId: string,
    payload: CreateCheckInPayload,
  ): Promise<AxiosResponse<CheckInResponseDto>> =>
    apiClient.post<CheckInResponseDto>(
      API_ENDPOINTS.ROUTINES.CHECK_INS(routineId),
      payload,
    ),

  listCheckIns: (
    routineId: string,
    query: DateRangeQuery,
  ): Promise<AxiosResponse<CheckInResponseDto[]>> =>
    apiClient.get<CheckInResponseDto[]>(
      API_ENDPOINTS.ROUTINES.CHECK_INS(routineId),
      {
        params: query,
      },
    ),

  getHistory: (
    routineId: string,
    query: DateRangeQuery,
  ): Promise<AxiosResponse<RoutineHistoryResponse>> =>
    apiClient.get<RoutineHistoryResponse>(
      API_ENDPOINTS.ROUTINES.HISTORY(routineId),
      { params: query },
    ),

  getHistoryDay: (
    routineId: string,
    date: string,
    period?: RoutinePeriod,
  ): Promise<AxiosResponse<HistoryDayDetailResponseDto>> =>
    apiClient.get<HistoryDayDetailResponseDto>(
      API_ENDPOINTS.ROUTINES.HISTORY_DAY(routineId, date),
      { params: period ? { period } : undefined },
    ),

  submitWeeklyCheckIn: (
    routineId: string,
    payload: {
      erythemaScore: number;
      drynessScore: number;
      acneScore: number;
      oilinessScore: number;
      symptoms: string[];
      photoUrls?: string[];
      notes?: string;
    },
  ): Promise<AxiosResponse<CheckInResponseDto>> =>
    apiClient.post<CheckInResponseDto>(
      API_ENDPOINTS.ROUTINES.WEEKLY_CHECK_IN(routineId),
      payload,
    ),

  reportSideEffect: (
    routineId: string,
    payload: {
      stepId?: string;
      productId?: string;
      severity: "MILD" | "MODERATE" | "SEVERE";
      description: string;
      photoUrls?: string[];
    },
  ): Promise<AxiosResponse<{ id: string; status: string }>> =>
    apiClient.post<{ id: string; status: string }>(
      API_ENDPOINTS.ROUTINES.SIDE_EFFECT(routineId),
      payload,
    ),
};
