import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type { Routine } from "../types/routine.types";

export const routinesApi = {
  getMyRoutines: (): Promise<AxiosResponse<Routine[]>> => {
    return apiClient.get<Routine[]>(API_ENDPOINTS.ROUTINES.ME);
  },

  generateRoutine: (orderId: string): Promise<AxiosResponse<Routine>> => {
    return apiClient.post<Routine>(API_ENDPOINTS.ROUTINES.GENERATE, {
      orderId,
    });
  },
};
