import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { appConfig } from "@/lib/env";
import { routinesApi } from "../api/routines.api";
import { routinesMock } from "../api/routines.mock";
import type { Routine } from "../types/routine.types";

export function useRoutines(enabled = true) {
  return useQuery({
    queryKey: queryKeys.routines,
    queryFn: async (): Promise<Routine[]> => {
      if (appConfig.useMockApi) {
        return routinesMock.getMyRoutines();
      }
      const response = await routinesApi.getMyRoutines();
      return response.data;
    },
    enabled,
  });
}

export function useGenerateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string): Promise<Routine> => {
      const response = await routinesApi.generateRoutine(orderId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines });
    },
  });
}
