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
        params: { page: 1, limit: 20, ...query },
        // `type` is an array. Axios's default array encoding is `type[]=A&type[]=B`,
        // but the backend runs Express 5 with the `simple` query parser (Node's
        // querystring), which reads that as the literal key "type[]" — so the
        // filter would be silently dropped by NestJS's whitelisting ValidationPipe.
        // `indexes: null` emits bare repeated keys: `type=A&type=B`.
        paramsSerializer: { indexes: null },
      },
    );
  },
};
