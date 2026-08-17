import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  ListAdminActivityQuery,
  PaginatedAdminActivity,
} from "../types/activity.types";

export const adminActivityApi = {
  list: (
    query?: ListAdminActivityQuery,
  ): Promise<AxiosResponse<PaginatedAdminActivity>> => {
    return apiClient.get<PaginatedAdminActivity>(
      API_ENDPOINTS.ADMIN_ACTIVITY.LIST,
      {
        // Axios serialises string[] as repeated `type=A&type=B`, which is the
        // repeatable form the endpoint expects.
        params: { page: 1, limit: 20, ...query },
      },
    );
  },
};
