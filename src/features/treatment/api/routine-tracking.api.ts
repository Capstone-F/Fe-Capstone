import type { AxiosResponse } from "axios";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  CreateCheckInPayload,
  DateRangeQuery,
  HistoryDayDetail,
  RoutineCheckIn,
  RoutineHistoryResponse,
  RoutinePeriod,
  SkipStepPayload,
  TodayRoutine,
  TodayRoutinesResponse,
} from "../types/routine-tracking.types";

export const routineTrackingApi = {
  getToday: (
    period?: RoutinePeriod,
  ): Promise<AxiosResponse<TodayRoutinesResponse>> =>
    apiClient.get<TodayRoutinesResponse>(API_ENDPOINTS.ROUTINES.TODAY, {
      params: period ? { period } : undefined,
    }),

  completeStep: (
    routineId: string,
    stepId: string,
  ): Promise<AxiosResponse<TodayRoutine>> =>
    apiClient.post<TodayRoutine>(
      API_ENDPOINTS.ROUTINES.STEP_COMPLETE(routineId, stepId),
    ),

  skipStep: (
    routineId: string,
    stepId: string,
    payload: SkipStepPayload,
  ): Promise<AxiosResponse<TodayRoutine>> =>
    apiClient.post<TodayRoutine>(
      API_ENDPOINTS.ROUTINES.STEP_SKIP(routineId, stepId),
      payload,
    ),

  createCheckIn: (
    routineId: string,
    payload: CreateCheckInPayload,
  ): Promise<AxiosResponse<RoutineCheckIn>> =>
    apiClient.post<RoutineCheckIn>(
      API_ENDPOINTS.ROUTINES.CHECK_INS(routineId),
      payload,
    ),

  listCheckIns: (
    routineId: string,
    query: DateRangeQuery,
  ): Promise<AxiosResponse<RoutineCheckIn[]>> =>
    apiClient.get<RoutineCheckIn[]>(
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
  ): Promise<AxiosResponse<HistoryDayDetail>> =>
    apiClient.get<HistoryDayDetail>(
      API_ENDPOINTS.ROUTINES.HISTORY_DAY(routineId, date),
      { params: period ? { period } : undefined },
    ),
};
