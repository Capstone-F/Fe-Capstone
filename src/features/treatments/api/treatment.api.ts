import { apiClient } from "@/core/api/client";
import type { AxiosResponse } from "axios";
import type { TreatmentPlan } from "../types/treatment.types";
import { treatmentMock } from "./treatment.mock";
import { mapBackendTreatmentToFrontend } from "../mapper/treatment.mapper";
import { appConfig } from "@/lib/env";

export const treatmentApi = {
  getPlans: async (
    customerId?: string,
  ): Promise<AxiosResponse<TreatmentPlan[]>> => {
    if (appConfig.useMockApi) {
      const data = await treatmentMock.getPlans(customerId);
      return { data } as AxiosResponse<TreatmentPlan[]>;
    }
    const res = await apiClient.get<Record<string, unknown>[]>("/treatments", {
      params: { customerId },
    });
    return {
      ...res,
      data: res.data.map(mapBackendTreatmentToFrontend),
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

  createPlan: async (
    planData: Partial<TreatmentPlan>,
  ): Promise<AxiosResponse<TreatmentPlan>> => {
    if (appConfig.useMockApi) {
      const data = await treatmentMock.createPlan(planData);
      return { data } as AxiosResponse<TreatmentPlan>;
    }
    const res = await apiClient.post<Record<string, unknown>>(
      "/treatments",
      planData,
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
};
