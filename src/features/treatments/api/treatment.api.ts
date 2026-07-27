import { apiClient } from "@/core/api/client";
import type { AxiosResponse } from "axios";
import type {
  TreatmentPlan,
  TreatmentPhase,
  ProductCandidate,
  Ingredient,
} from "../types/treatment.types";
import { treatmentMock } from "./treatment.mock";
import { mapBackendTreatmentToFrontend } from "../mapper/treatment.mapper";
import { appConfig } from "@/lib/env";

export const treatmentApi = {
  getPlans: async (
    customerId?: string,
    as?: "customer" | "expert",
  ): Promise<AxiosResponse<TreatmentPlan[]>> => {
    if (appConfig.useMockApi) {
      const data = await treatmentMock.getPlans(customerId);
      return { data } as AxiosResponse<TreatmentPlan[]>;
    }
    const res = await apiClient.get<Record<string, unknown>[]>(
      "/treatments/me",
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
    if (appConfig.useMockApi) {
      const data = await treatmentMock.getPlanById(id);
      if (!data) throw new Error("Plan not found");
      return { data } as AxiosResponse<TreatmentPlan>;
    }
    const res = await apiClient.get<Record<string, unknown>>(
      `/treatments/${id}`,
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
    sourceConsultationId?: string;
  }): Promise<AxiosResponse<TreatmentPlan>> => {
    if (appConfig.useMockApi) {
      const data = await treatmentMock.createPlan(payload);
      return { data } as AxiosResponse<TreatmentPlan>;
    }
    const res = await apiClient.post<Record<string, unknown>>(
      "/treatments",
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
      phaseType: "INITIAL" | "TREATMENT" | "MAINTENANCE";
      title: string;
      notes?: string;
      priceVnd: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    if (appConfig.useMockApi) {
      const data: TreatmentPhase = {
        id: `phase_${Date.now()}`,
        phaseNumber: 1,
        title: payload.title,
        durationWeeks: 4,
        priceVnd: payload.priceVnd,
        status: "DRAFT",
        targetIngredients: [],
        amSteps: [],
        pmSteps: [],
        notes: payload.notes,
      };
      return { data } as AxiosResponse<TreatmentPhase>;
    }
    const res = await apiClient.post<TreatmentPhase>(
      `/treatments/${treatmentId}/phases`,
      payload,
    );
    return res;
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
    if (appConfig.useMockApi) {
      return { data: { id: phaseId } } as AxiosResponse<TreatmentPhase>;
    }
    return apiClient.patch<TreatmentPhase>(
      `/treatments/phases/${phaseId}`,
      payload,
    );
  },

  deletePhase: async (phaseId: string): Promise<AxiosResponse<void>> => {
    if (appConfig.useMockApi) {
      return { data: undefined } as AxiosResponse<void>;
    }
    return apiClient.delete<void>(`/treatments/phases/${phaseId}`);
  },

  submitPlan: async (id: string): Promise<AxiosResponse<TreatmentPlan>> => {
    if (appConfig.useMockApi) {
      const data = await treatmentMock.getPlanById(id);
      if (data) data.status = "PENDING_PAYMENT";
      return { data } as AxiosResponse<TreatmentPlan>;
    }
    const res = await apiClient.post<Record<string, unknown>>(
      `/treatments/${id}/submit`,
    );
    return {
      ...res,
      data: mapBackendTreatmentToFrontend(res.data),
    };
  },

  payTreatmentPlan: async (
    id: string,
  ): Promise<AxiosResponse<TreatmentPlan>> => {
    if (appConfig.useMockApi) {
      const data = await treatmentMock.getPlanById(id);
      if (data) data.status = "ACTIVE";
      return { data } as AxiosResponse<TreatmentPlan>;
    }
    const res = await apiClient.post<Record<string, unknown>>(
      `/treatments/${id}/pay`,
    );
    return {
      ...res,
      data: mapBackendTreatmentToFrontend(res.data),
    };
  },

  getIngredients: async (): Promise<AxiosResponse<Ingredient[]>> => {
    if (appConfig.useMockApi) {
      return {
        data: [
          { id: "ing_1", name: "Azelaic Acid", category: "Anti-acne" },
          { id: "ing_2", name: "Niacinamide", category: "Soothing" },
          { id: "ing_3", name: "Hyaluronic Acid", category: "Moisturizer" },
          { id: "ing_4", name: "Glycolic Acid", category: "Exfoliant" },
        ],
      } as AxiosResponse<Ingredient[]>;
    }
    return apiClient.get<Ingredient[]>("/ingredients");
  },

  setPhaseIngredients: async (
    phaseId: string,
    ingredientIds: string[],
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    if (appConfig.useMockApi) {
      return { data: {} } as AxiosResponse<TreatmentPhase>;
    }
    return apiClient.post<TreatmentPhase>(
      `/treatments/phases/${phaseId}/ingredients`,
      { ingredientIds },
    );
  },

  getProductCandidates: async (
    phaseId: string,
  ): Promise<AxiosResponse<ProductCandidate[]>> => {
    if (appConfig.useMockApi) {
      return {
        data: [
          {
            productVariantId: "var_1",
            sku: "SKU-001",
            productName: "Serum Azelaic Acid 10%",
            brand: "GlowScan Derm",
            priceVnd: 350000,
            overlapScore: 100,
            matchedIngredients: ["Azelaic Acid"],
          },
          {
            productVariantId: "var_2",
            sku: "SKU-002",
            productName: "Niacinamide 10% + Zinc 1%",
            brand: "GlowScan Derm",
            priceVnd: 280000,
            overlapScore: 80,
            matchedIngredients: ["Niacinamide"],
          },
        ],
      } as AxiosResponse<ProductCandidate[]>;
    }
    return apiClient.get<ProductCandidate[]>(
      `/treatments/phases/${phaseId}/product-candidates`,
    );
  },

  setPhaseProducts: async (
    phaseId: string,
    productVariantIds: string[],
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    if (appConfig.useMockApi) {
      return { data: {} } as AxiosResponse<TreatmentPhase>;
    }
    return apiClient.post<TreatmentPhase>(
      `/treatments/phases/${phaseId}/products`,
      { productVariantIds },
    );
  },

  generateRoutine: async (
    phaseId: string,
  ): Promise<AxiosResponse<Record<string, unknown>>> => {
    if (appConfig.useMockApi) {
      return { data: { id: "rot_1" } } as AxiosResponse<
        Record<string, unknown>
      >;
    }
    return apiClient.post<Record<string, unknown>>(
      `/treatments/phases/${phaseId}/routines/generate`,
    );
  },

  saveRoutine: async (
    routineId: string,
  ): Promise<AxiosResponse<Record<string, unknown>>> => {
    if (appConfig.useMockApi) {
      return { data: {} } as AxiosResponse<Record<string, unknown>>;
    }
    return apiClient.post<Record<string, unknown>>(
      `/treatments/routines/${routineId}/save`,
    );
  },

  updateRoutine: async (
    routineId: string,
    payload: Record<string, unknown>,
  ): Promise<AxiosResponse<Record<string, unknown>>> => {
    if (appConfig.useMockApi) {
      return { data: {} } as AxiosResponse<Record<string, unknown>>;
    }
    return apiClient.patch<Record<string, unknown>>(
      `/treatments/routines/${routineId}`,
      payload,
    );
  },

  activatePhase: async (
    phaseId: string,
  ): Promise<AxiosResponse<TreatmentPhase>> => {
    if (appConfig.useMockApi) {
      return { data: {} } as AxiosResponse<TreatmentPhase>;
    }
    return apiClient.post<TreatmentPhase>(
      `/treatments/phases/${phaseId}/activate`,
    );
  },
};
