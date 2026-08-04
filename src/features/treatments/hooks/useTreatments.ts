import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/keys";
import { treatmentApi } from "../api/treatment.api";
import type {
  CreateTreatmentPayload,
  TreatmentEventType,
  TreatmentListFilters,
  TreatmentPhasePayload,
  UpdateExpertRoutinePayload,
} from "../types/treatment.types";

function useInvalidateTreatments() {
  const queryClient = useQueryClient();
  return (treatmentId?: string) => {
    void queryClient.invalidateQueries({ queryKey: ["treatments"] });
    if (treatmentId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.treatment(treatmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.treatmentChart(treatmentId),
      });
    }
  };
}

export function useTreatmentPlans(
  as: "customer" | "expert" = "customer",
  filters: TreatmentListFilters = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.treatmentPlans(as, filters),
    queryFn: async () => (await treatmentApi.getPlans(as, filters)).data,
    placeholderData: (previous) => previous,
    enabled: options.enabled ?? true,
  });
}

export function useTreatmentPlanDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.treatment(id),
    queryFn: async () => (await treatmentApi.getPlanById(id)).data,
    enabled: Boolean(id),
  });
}

export function useTreatmentChart(id: string) {
  return useQuery({
    queryKey: queryKeys.treatmentChart(id),
    queryFn: async () => (await treatmentApi.getChart(id)).data,
    enabled: Boolean(id),
  });
}

export function useTreatmentEvents(id: string, type?: TreatmentEventType) {
  return useQuery({
    queryKey: queryKeys.treatmentEvents(id, type),
    queryFn: async () => (await treatmentApi.getEvents(id, type)).data,
    enabled: Boolean(id),
  });
}

export function useCreateTreatmentPlan() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async (payload: CreateTreatmentPayload) =>
      (await treatmentApi.createPlan(payload)).data,
    onSuccess: (plan) => invalidate(plan.id),
  });
}

export function useAddPhase() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async ({
      treatmentId,
      payload,
    }: {
      treatmentId: string;
      payload: TreatmentPhasePayload;
    }) => (await treatmentApi.addPhase(treatmentId, payload)).data,
    onSuccess: (phase) => invalidate(phase.treatmentId),
  });
}

export function useUpdatePhase() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async ({
      phaseId,
      treatmentId,
      payload,
    }: {
      phaseId: string;
      treatmentId: string;
      payload: Partial<TreatmentPhasePayload>;
    }) => ({
      phase: (await treatmentApi.updatePhase(phaseId, payload)).data,
      treatmentId,
    }),
    onSuccess: ({ treatmentId }) => invalidate(treatmentId),
  });
}

export function useDeletePhase() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async ({
      phaseId,
      treatmentId,
    }: {
      phaseId: string;
      treatmentId: string;
    }) => {
      await treatmentApi.deletePhase(phaseId);
      return treatmentId;
    },
    onSuccess: invalidate,
  });
}

export function useSubmitPlan() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async (treatmentId: string) =>
      (await treatmentApi.submitPlan(treatmentId)).data,
    onSuccess: (plan) => invalidate(plan.id),
  });
}

export function usePayTreatmentPlan() {
  const invalidate = useInvalidateTreatments();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (treatmentId: string) =>
      (await treatmentApi.payTreatmentPlan(treatmentId)).data,
    onSuccess: (plan) => {
      invalidate(plan.id);
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useCancelTreatment() {
  const invalidate = useInvalidateTreatments();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) =>
      (await treatmentApi.cancelTreatment(id, reason)).data,
    onSuccess: (plan) => {
      invalidate(plan.id);
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useCreateProgressPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      treatmentId,
      file,
      title,
      note,
    }: {
      treatmentId: string;
      file: File;
      title: string;
      note?: string;
    }) => {
      const upload = await treatmentApi.uploadImage(file);
      return (
        await treatmentApi.createEvent(treatmentId, {
          type: "PROGRESS_PHOTO",
          title,
          note,
          photoUrl: upload.data.url,
        })
      ).data;
    },
    onSuccess: (event) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.treatmentChart(event.treatmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: ["treatments", event.treatmentId, "events"],
      });
    },
  });
}

export function useIngredients() {
  return useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => (await treatmentApi.getIngredients()).data,
  });
}

export function useProductCandidates(phaseId?: string) {
  return useQuery({
    queryKey: ["product-candidates", phaseId],
    queryFn: async () =>
      phaseId ? (await treatmentApi.getProductCandidates(phaseId)).data : [],
    enabled: Boolean(phaseId),
  });
}

export function useSetPhaseIngredients() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async ({
      phaseId,
      ingredientIds,
    }: {
      phaseId: string;
      ingredientIds: string[];
    }) => (await treatmentApi.setPhaseIngredients(phaseId, ingredientIds)).data,
    onSuccess: (phase) => invalidate(phase.treatmentId),
  });
}

export function useSetPhaseProducts() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async ({
      phaseId,
      productVariantIds,
    }: {
      phaseId: string;
      productVariantIds: string[];
    }) =>
      (await treatmentApi.setPhaseProducts(phaseId, productVariantIds)).data,
    onSuccess: (phase) => invalidate(phase.treatmentId),
  });
}

export function useGenerateRoutine() {
  return useMutation({
    mutationFn: async (phaseId: string) =>
      (await treatmentApi.generateRoutine(phaseId)).data,
  });
}

export function useSaveRoutine() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async ({
      routineId,
      treatmentId,
    }: {
      routineId: string;
      treatmentId: string;
    }) => ({
      routine: (await treatmentApi.saveRoutine(routineId)).data,
      treatmentId,
    }),
    onSuccess: ({ treatmentId }) => invalidate(treatmentId),
  });
}

export function useUpdateRoutine() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async ({
      routineId,
      treatmentId,
      payload,
    }: {
      routineId: string;
      treatmentId: string;
      payload: UpdateExpertRoutinePayload;
    }) => ({
      routine: (await treatmentApi.updateRoutine(routineId, payload)).data,
      treatmentId,
    }),
    onSuccess: ({ treatmentId }) => invalidate(treatmentId),
  });
}

export function useActivatePhase() {
  const invalidate = useInvalidateTreatments();
  return useMutation({
    mutationFn: async (phaseId: string) =>
      (await treatmentApi.activatePhase(phaseId)).data,
    onSuccess: (phase) => invalidate(phase.treatmentId),
  });
}
