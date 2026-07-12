import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { getMyRoutines, generateRoutine } from "../api/routines-client";

export function useRoutines() {
  return useQuery({
    queryKey: queryKeys.routines,
    queryFn: getMyRoutines,
  });
}

export function useGenerateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => generateRoutine(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.routines });
    },
  });
}
