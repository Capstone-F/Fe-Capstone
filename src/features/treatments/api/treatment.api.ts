import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  TreatmentPlan,
  TreatmentPhase,
  ProductCandidate,
  Ingredient,
} from "../types/treatment.types";
import { mapBackendTreatmentToFrontend } from "../mapper/treatment.mapper";

export const treatmentApi = {
  getPlans: async (
    customerId?: string,
    as?: "customer" | "expert",
  ): Promise<AxiosResponse<TreatmentPlan[]>> => {
    const res = await apiClient.get<Record<string, unknown>[]>(
      API_ENDPOINTS.TREATMENTS.LIST_MINE,
      {
        params: { customerId, as },
      },
    );
    return {
      ...res,
      data: (res.data || []).map(mapBackendTreatmentToFrontend),
    };
  },

  getPlanById: async (id: string): Promise<AxiosResponse<TreatmentPlan>> => {
    const res = await apiClient.get<Record<string, unknown>>(
      API_ENDPOINTS.TREATMENTS.DETAIL(id),
    );
    return {
      ...res,
      data: mapBackendTreatmentToFrontend(res.data),
    };
  },

  createPlan: async (payload: {
    customerId: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    sourceConsultationId?: string;
  }): Promise<AxiosResponse<TreatmentPlan>> => {
    const res = await apiClient.post<Record<string, unknown>>(
      API_ENDPOINTS.TREATMENTS.CREATE,
      payload,
    );
    return {
      ...res,
      data: mapBackendTreatmentToFrontend(res.data),
    };
  },

  addPhase: async (
    treatmentId: string,
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
    },
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    return apiClient.post<TreatmentPhase>(
      API_ENDPOINTS.TREATMENTS.PHASES(treatmentId),
      payload,
    );
  },

  updatePhase: async (
    phaseId: string,
    payload: {
      title?: string;
      notes?: string;
      priceVnd?: number;
      durationWeeks?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    return apiClient.patch<TreatmentPhase>(
      API_ENDPOINTS.TREATMENTS.PHASE_DETAIL(phaseId),
      payload,
    );
  },

  deletePhase: async (phaseId: string): Promise<AxiosResponse<void>> => {
    return apiClient.delete<void>(
      API_ENDPOINTS.TREATMENTS.PHASE_DETAIL(phaseId),
    );
  },

  submitPlan: async (id: string): Promise<AxiosResponse<TreatmentPlan>> => {
    const res = await apiClient.post<Record<string, unknown>>(
      API_ENDPOINTS.TREATMENTS.SUBMIT(id),
    );
    return {
      ...res,
      data: mapBackendTreatmentToFrontend(res.data),
    };
  },

  payTreatmentPlan: async (
    id: string,
  ): Promise<AxiosResponse<TreatmentPlan>> => {
    const res = await apiClient.post<Record<string, unknown>>(
      API_ENDPOINTS.TREATMENTS.PAY(id),
    );
    return {
      ...res,
      data: mapBackendTreatmentToFrontend(res.data),
    };
  },

  getIngredients: async (): Promise<AxiosResponse<Ingredient[]>> => {
    return apiClient.get<Ingredient[]>(API_ENDPOINTS.INGREDIENTS.LIST);
  },

  setPhaseIngredients: async (
    phaseId: string,
    ingredientIds: string[],
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    return apiClient.post<TreatmentPhase>(
      API_ENDPOINTS.TREATMENTS.SET_INGREDIENTS(phaseId),
      { ingredientIds },
    );
  },

  getProductCandidates: async (
    phaseId: string,
  ): Promise<AxiosResponse<ProductCandidate[]>> => {
    return apiClient.get<ProductCandidate[]>(
      API_ENDPOINTS.TREATMENTS.PRODUCT_CANDIDATES(phaseId),
    );
  },

  setPhaseProducts: async (
    phaseId: string,
    productVariantIds: string[],
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    return apiClient.post<TreatmentPhase>(
      API_ENDPOINTS.TREATMENTS.SET_PRODUCTS(phaseId),
      { productVariantIds },
    );
  },

  generateRoutine: async (
    phaseId: string,
  ): Promise<AxiosResponse<Record<string, unknown>>> => {
    return apiClient.post<Record<string, unknown>>(
      API_ENDPOINTS.TREATMENTS.ROUTINE_GENERATE(phaseId),
    );
  },

  saveRoutine: async (
    routineId: string,
  ): Promise<AxiosResponse<Record<string, unknown>>> => {
    return apiClient.post<Record<string, unknown>>(
      API_ENDPOINTS.TREATMENTS.ROUTINE_SAVE(routineId),
    );
  },

  updateRoutine: async (
    routineId: string,
    payload: Record<string, unknown>,
  ): Promise<AxiosResponse<Record<string, unknown>>> => {
    return apiClient.patch<Record<string, unknown>>(
      API_ENDPOINTS.TREATMENTS.ROUTINE_UPDATE(routineId),
      payload,
    );
  },

  activatePhase: async (
    phaseId: string,
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    return apiClient.post<TreatmentPhase>(
      API_ENDPOINTS.TREATMENTS.ACTIVATE_PHASE(phaseId),
    );
  },
};
