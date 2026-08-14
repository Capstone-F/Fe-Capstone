import type { AxiosResponse } from "axios";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  SeedDemoCustomerPayload,
  SeedDemoCustomerResponse,
} from "../types/demo-customer.types";

export const adminDemoApi = {
  seedCustomer: (
    payload: SeedDemoCustomerPayload,
  ): Promise<AxiosResponse<SeedDemoCustomerResponse>> =>
    apiClient.post<SeedDemoCustomerResponse>(
      API_ENDPOINTS.ADMIN_QA_CHEATS.SEED_DEMO_CUSTOMER,
      payload,
    ),
};
