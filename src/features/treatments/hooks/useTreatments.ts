import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentApi } from "../api/treatment.api";
import type { TreatmentPlan } from "../types/treatment.types";

export function useTreatmentPlans(customerId?: string) {
  return useQuery({
    queryKey: ["treatment-plans", customerId],
    queryFn: async () => {
      const response = await treatmentApi.getPlans(customerId);
      return response.data;
    },
  });
}

export function useTreatmentPlanDetail(id: string) {
  return useQuery({
    queryKey: ["treatment-plan", id],
    queryFn: async () => {
      const response = await treatmentApi.getPlanById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTreatmentPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planData: Partial<TreatmentPlan>) => {
      const response = await treatmentApi.createPlan(planData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}
