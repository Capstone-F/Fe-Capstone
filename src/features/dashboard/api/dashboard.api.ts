import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type {
  AdminDashboardResponse,
  DashboardRange,
  ExpertDashboardResponse,
  StaffDashboardResponse,
} from "../types/dashboard.types";

export const dashboardApi = {
  getAdmin: async (range: DashboardRange) => {
    const response = await apiClient.get<AdminDashboardResponse>(
      API_ENDPOINTS.DASHBOARDS.ADMIN,
      { params: { range } },
    );
    return response.data;
  },
  getExpert: async (range: DashboardRange) => {
    const response = await apiClient.get<ExpertDashboardResponse>(
      API_ENDPOINTS.DASHBOARDS.EXPERT,
      { params: { range } },
    );
    return response.data;
  },
  getStaff: async (range: DashboardRange) => {
    const response = await apiClient.get<StaffDashboardResponse>(
      API_ENDPOINTS.DASHBOARDS.STAFF,
      { params: { range } },
    );
    return response.data;
  },
};
