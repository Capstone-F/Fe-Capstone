import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { treatmentApi } from "../api/treatment.api";

export function useTreatmentPlans(
  customerId?: string,
  as?: "customer" | "expert",
) {
  return useQuery({
    queryKey: ["treatment-plans", customerId, as],
    queryFn: async () => {
      const response = await treatmentApi.getPlans(customerId, as);
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
    mutationFn: async (payload: {
      customerId: string;
      title: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      sourceConsultationId?: string;
    }) => {
      const response = await treatmentApi.createPlan(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function useAddPhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      treatmentId,
      payload,
    }: {
      treatmentId: string;
      payload: {
        phaseType:
          | "INITIAL_ASSESSMENT"
          | "ACTIVE_TREATMENT"
          | "MAINTENANCE"
          | "RECOVERY"
          | "INITIAL"
          | "TREATMENT";
        title: string;
        notes?: string;
        priceVnd: number;
        startDate?: string;
        endDate?: string;
      };
    }) => {
      const response = await treatmentApi.addPhase(treatmentId, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function useSubmitPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (treatmentId: string) => {
      const response = await treatmentApi.submitPlan(treatmentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function usePayTreatmentPlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (treatmentId: string) => {
      const response = await treatmentApi.payTreatmentPlan(treatmentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const response = await treatmentApi.getIngredients();
      return response.data;
    },
  });
}

export function useSetPhaseIngredients() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phaseId,
      ingredientIds,
    }: {
      phaseId: string;
      ingredientIds: string[];
    }) => {
      const response = await treatmentApi.setPhaseIngredients(
        phaseId,
        ingredientIds,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-candidates"] });
    },
  });
}

export function useUpdatePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phaseId,
      payload,
    }: {
      phaseId: string;
      payload: {
        title?: string;
        notes?: string;
        priceVnd?: number;
        durationWeeks?: number;
        startDate?: string;
        endDate?: string;
      };
    }) => {
      const response = await treatmentApi.updatePhase(phaseId, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function useDeletePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phaseId: string) => {
      const response = await treatmentApi.deletePhase(phaseId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

const isUuid = (id?: string) =>
  !!id &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function useProductCandidates(phaseId?: string) {
  return useQuery({
    queryKey: ["product-candidates", phaseId],
    queryFn: async () => {
      if (!phaseId || !isUuid(phaseId)) return [];
      const response = await treatmentApi.getProductCandidates(phaseId);
      return response.data;
    },
    enabled: isUuid(phaseId),
  });
}

export function useSetPhaseProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phaseId,
      productVariantIds,
    }: {
      phaseId: string;
      productVariantIds: string[];
    }) => {
      const response = await treatmentApi.setPhaseProducts(
        phaseId,
        productVariantIds,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function useGenerateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phaseId: string) => {
      const response = await treatmentApi.generateRoutine(phaseId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function useSaveRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (routineId: string) => {
      const response = await treatmentApi.saveRoutine(routineId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      routineId,
      payload,
    }: {
      routineId: string;
      payload: Record<string, unknown>;
    }) => {
      const response = await treatmentApi.updateRoutine(routineId, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}

export function useActivatePhase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (phaseId: string) => {
      const response = await treatmentApi.activatePhase(phaseId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans"] });
    },
  });
}
