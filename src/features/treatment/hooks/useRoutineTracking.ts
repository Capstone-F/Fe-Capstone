import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { ApiError } from "@/core/api/errors";
import { queryKeys } from "@/lib/query/keys";
import { routineTrackingApi } from "../api/routine-tracking.api";
import { aggregateSessionState } from "../lib/care-hub-state";
import {
  mapCheckIn,
  mapHistoryDayDetail,
  mapTodayRoutine,
  mapTodaySession,
} from "../mapper/routine-tracking.mapper";
import type {
  CreateCheckInPayload,
  DateRangeQuery,
  HistoryDayDetail,
  RoutineCheckIn,
  RoutineHistoryResponse,
  RoutinePeriod,
  SkipStepPayload,
  TodayRoutine,
  TodaySession,
} from "../types/routine-tracking.types";

/**
 * Cache key for the Today query. `undefined` means "let the backend pick the period
 * from its own Asia/Ho_Chi_Minh clock" — a distinct cache entry from an explicit tab.
 */
function todayQueryKey(period: RoutinePeriod | undefined) {
  return queryKeys.routineToday(period ?? "auto");
}

/** Replace one routine inside the cached Today payload for instant progress feedback. */
function applyRoutineUpdate(
  queryClient: QueryClient,
  period: RoutinePeriod | undefined,
  updated: TodayRoutine,
): void {
  queryClient.setQueryData<TodaySession>(todayQueryKey(period), (previous) => {
    if (!previous) {
      return previous;
    }
    const routines = previous.routines.map((routine) =>
      routine.id === updated.id ? updated : routine,
    );
    // Re-derive the aggregate with the same rule the backend uses, otherwise it stays
    // stale until the refetch lands and the check-in prompt fires a beat late.
    return {
      ...previous,
      routines,
      sessionState: aggregateSessionState(routines),
    };
  });
  void queryClient.invalidateQueries({ queryKey: queryKeys.routines });
}

/**
 * Today's session. Omit `period` on first load so the backend applies its documented
 * default (VN hour < 14 → MORNING, else EVENING) instead of the client guessing.
 */
export function useTodayRoutines(
  period?: RoutinePeriod,
  options?: { enabled?: boolean },
) {
  return useQuery<TodaySession, ApiError>({
    queryKey: todayQueryKey(period),
    queryFn: async () =>
      mapTodaySession((await routineTrackingApi.getToday(period)).data),
    // Guests would otherwise fire an authenticated call and get a 401 on /care.
    enabled: options?.enabled ?? true,
  });
}

export function useCompleteStep(period?: RoutinePeriod) {
  const queryClient = useQueryClient();
  return useMutation<
    TodayRoutine,
    ApiError,
    { routineId: string; stepId: string }
  >({
    mutationFn: async ({ routineId, stepId }) =>
      mapTodayRoutine(
        (await routineTrackingApi.completeStep(routineId, stepId)).data,
      ),
    onSuccess: (updated) => applyRoutineUpdate(queryClient, period, updated),
  });
}

export function useSkipStep(period?: RoutinePeriod) {
  const queryClient = useQueryClient();
  return useMutation<
    TodayRoutine,
    ApiError,
    { routineId: string; stepId: string; payload: SkipStepPayload }
  >({
    mutationFn: async ({ routineId, stepId, payload }) =>
      mapTodayRoutine(
        (await routineTrackingApi.skipStep(routineId, stepId, payload)).data,
      ),
    onSuccess: (updated) => applyRoutineUpdate(queryClient, period, updated),
  });
}

export function useCreateCheckIn(routineId: string) {
  const queryClient = useQueryClient();
  return useMutation<RoutineCheckIn, ApiError, CreateCheckInPayload>({
    mutationFn: async (payload) =>
      mapCheckIn(
        (await routineTrackingApi.createCheckIn(routineId, payload)).data,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.routines });
    },
  });
}

export function useTodayCheckIns(
  routineId: string | undefined,
  date: string | undefined,
) {
  return useQuery<RoutineCheckIn[], ApiError>({
    queryKey: queryKeys.routineCheckIns(
      routineId ?? "",
      date ?? "",
      date ?? "",
    ),
    queryFn: async () => {
      const response = await routineTrackingApi.listCheckIns(
        routineId as string,
        { from: date as string, to: date as string },
      );
      return response.data.map(mapCheckIn);
    },
    enabled: Boolean(routineId) && Boolean(date),
  });
}

export function useRoutineHistory(
  routineId: string | undefined,
  range: DateRangeQuery | undefined,
) {
  return useQuery<RoutineHistoryResponse, ApiError>({
    queryKey: queryKeys.routineHistory(
      routineId ?? "",
      range?.from ?? "",
      range?.to ?? "",
    ),
    // Calendar payload needs no mapping — see RoutineHistoryResponse.
    queryFn: async () =>
      (
        await routineTrackingApi.getHistory(
          routineId as string,
          range as DateRangeQuery,
        )
      ).data,
    enabled: Boolean(routineId) && Boolean(range),
  });
}

export function useHistoryDay(
  routineId: string | undefined,
  date: string | undefined,
  period: RoutinePeriod,
) {
  return useQuery<HistoryDayDetail, ApiError>({
    queryKey: queryKeys.routineHistoryDay(routineId ?? "", date ?? "", period),
    queryFn: async () =>
      mapHistoryDayDetail(
        (
          await routineTrackingApi.getHistoryDay(
            routineId as string,
            date as string,
            period,
          )
        ).data,
      ),
    enabled: Boolean(routineId) && Boolean(date),
  });
}
