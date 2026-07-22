import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

interface CustomerProfileResponse {
  customer: { id: string } | null;
}

export const customersApi = {
  getCustomerProfile: (): Promise<AxiosResponse<CustomerProfileResponse>> => {
    return apiClient.get<CustomerProfileResponse>(API_ENDPOINTS.CUSTOMERS.ME);
  },

  provisionCustomer: (): Promise<AxiosResponse<CustomerProfileResponse>> => {
    return apiClient.patch<CustomerProfileResponse>(
      API_ENDPOINTS.CUSTOMERS.ME,
      {
        allergyLabelCodes: [],
      },
    );
  },
};
