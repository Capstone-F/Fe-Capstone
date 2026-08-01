import type { AxiosResponse } from "axios";

import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import {
  mapBackendPhase,
  mapBackendTreatmentToFrontend,
  type BackendTreatmentResponse,
} from "../mapper/treatment.mapper";
import type {
  CreateTreatmentPayload,
  Ingredient,
  ProductCandidate,
  TreatmentChart,
  TreatmentEvent,
  TreatmentEventType,
  TreatmentPhase,
  TreatmentPhasePayload,
  TreatmentPlan,
  UploadImageResponse,
} from "../types/treatment.types";

type BackendTreatmentPhase = Parameters<typeof mapBackendPhase>[0];

async function mapTreatmentResponse(
  request: Promise<AxiosResponse<BackendTreatmentResponse>>,
): Promise<AxiosResponse<TreatmentPlan>> {
  const response = await request;
  return { ...response, data: mapBackendTreatmentToFrontend(response.data) };
}

async function mapPhaseResponse(
  request: Promise<AxiosResponse<BackendTreatmentPhase>>,
): Promise<AxiosResponse<TreatmentPhase>> {
  const response = await request;
  return { ...response, data: mapBackendPhase(response.data) };
}

export const treatmentApi = {
  async getPlans(
    as: "customer" | "expert" = "customer",
  ): Promise<AxiosResponse<TreatmentPlan[]>> {
    const response = await apiClient.get<BackendTreatmentResponse[]>(
      API_ENDPOINTS.TREATMENTS.LIST_MINE,
      { params: { as } },
    );
    return {
      ...response,
      data: response.data.map(mapBackendTreatmentToFrontend),
    };
  },

  getPlanById(id: string): Promise<AxiosResponse<TreatmentPlan>> {
    return mapTreatmentResponse(
      apiClient.get(API_ENDPOINTS.TREATMENTS.DETAIL(id)),
    );
  },

  createPlan(
    payload: CreateTreatmentPayload,
  ): Promise<AxiosResponse<TreatmentPlan>> {
    return mapTreatmentResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.CREATE, payload),
    );
  },

  addPhase(
    treatmentId: string,
    payload: TreatmentPhasePayload,
  ): Promise<AxiosResponse<TreatmentPhase>> {
    return mapPhaseResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.PHASES(treatmentId), payload),
    );
  },

  updatePhase(
    phaseId: string,
    payload: Partial<TreatmentPhasePayload>,
  ): Promise<AxiosResponse<TreatmentPhase>> {
    return mapPhaseResponse(
      apiClient.patch(API_ENDPOINTS.TREATMENTS.PHASE_DETAIL(phaseId), payload),
    );
  },

  deletePhase(phaseId: string): Promise<AxiosResponse<void>> {
    return apiClient.delete(API_ENDPOINTS.TREATMENTS.PHASE_DETAIL(phaseId));
  },

  submitPlan(id: string): Promise<AxiosResponse<TreatmentPlan>> {
    return mapTreatmentResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.SUBMIT(id)),
    );
  },

  payTreatmentPlan(id: string): Promise<AxiosResponse<TreatmentPlan>> {
    return mapTreatmentResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.PAY(id)),
    );
  },

  cancelTreatment(
    id: string,
    reason?: string,
  ): Promise<AxiosResponse<TreatmentPlan>> {
    return mapTreatmentResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.CANCEL(id), { reason }),
    );
  },

  getChart(id: string): Promise<AxiosResponse<TreatmentChart>> {
    return apiClient.get(API_ENDPOINTS.TREATMENTS.CHART(id));
  },

  getEvents(
    id: string,
    type?: TreatmentEventType,
  ): Promise<AxiosResponse<TreatmentEvent[]>> {
    return apiClient.get(API_ENDPOINTS.TREATMENTS.EVENTS(id), {
      params: type ? { type } : undefined,
    });
  },

  createEvent(
    treatmentId: string,
    payload: {
      type: TreatmentEventType;
      title: string;
      note?: string;
      photoUrl?: string;
      occurredAt?: string;
    },
  ): Promise<AxiosResponse<TreatmentEvent>> {
    return apiClient.post(
      API_ENDPOINTS.TREATMENTS.EVENTS(treatmentId),
      payload,
    );
  },

  updateEventPhoto(
    treatmentId: string,
    eventId: string,
    photoUrl: string,
  ): Promise<AxiosResponse<TreatmentEvent>> {
    return apiClient.patch(
      API_ENDPOINTS.TREATMENTS.EVENT(treatmentId, eventId),
      { photoUrl },
    );
  },

  uploadImage(file: File): Promise<AxiosResponse<UploadImageResponse>> {
    const data = new FormData();
    data.append("file", file);
    return apiClient.post(API_ENDPOINTS.UPLOADS.IMAGE, data);
  },

  getIngredients(): Promise<AxiosResponse<Ingredient[]>> {
    return apiClient.get(API_ENDPOINTS.INGREDIENTS.LIST);
  },

  setPhaseIngredients(
    phaseId: string,
    ingredientIds: string[],
  ): Promise<AxiosResponse<TreatmentPhase>> {
    return mapPhaseResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.SET_INGREDIENTS(phaseId), {
        ingredientIds,
      }),
    );
  },

  getProductCandidates(
    phaseId: string,
  ): Promise<AxiosResponse<ProductCandidate[]>> {
    return apiClient.get(API_ENDPOINTS.TREATMENTS.PRODUCT_CANDIDATES(phaseId));
  },

  setPhaseProducts(
    phaseId: string,
    productVariantIds: string[],
  ): Promise<AxiosResponse<TreatmentPhase>> {
    return mapPhaseResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.SET_PRODUCTS(phaseId), {
        productVariantIds,
      }),
    );
  },

  generateRoutine(phaseId: string): Promise<AxiosResponse<{ id: string }>> {
    return apiClient.post(API_ENDPOINTS.TREATMENTS.ROUTINE_GENERATE(phaseId));
  },

  saveRoutine(routineId: string): Promise<AxiosResponse<{ id: string }>> {
    return apiClient.post(API_ENDPOINTS.TREATMENTS.ROUTINE_SAVE(routineId));
  },

  updateRoutine(
    routineId: string,
    payload: Record<string, unknown>,
  ): Promise<AxiosResponse<{ id: string }>> {
    return apiClient.patch(
      API_ENDPOINTS.TREATMENTS.ROUTINE_UPDATE(routineId),
      payload,
    );
  },

  activatePhase(phaseId: string): Promise<AxiosResponse<TreatmentPhase>> {
    return mapPhaseResponse(
      apiClient.post(API_ENDPOINTS.TREATMENTS.ACTIVATE_PHASE(phaseId)),
    );
  },
};
