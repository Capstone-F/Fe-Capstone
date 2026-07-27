import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { appConfig } from "@/lib/env";
import { expertsApi } from "../api/experts.api";
import { expertsMock } from "../api/experts.mock";
import {
  mapBackendExpertToFrontend,
  mapSpecialtyToBackend,
} from "../mapper/expert-mapper";
import type { Expert, BackendExpert } from "../types/expert.types";

export function useExperts(
  filters?: {
    specialty?: string;
    search?: string;
    minRating?: number;
    maxFee?: number;
    maxDistance?: number;
    lat?: number;
    lng?: number;
  },
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: queryKeys.experts(filters),
    queryFn: async () => {
      if (appConfig.useMockApi) {
        return expertsMock.getExperts(filters);
      }

      const params: Record<string, string> = {};

      if (filters) {
        const { specialty, minRating, maxFee, maxDistance, lat, lng } = filters;
        if (specialty && specialty !== "Tất cả") {
          const spec = mapSpecialtyToBackend(specialty);
          if (spec) params.specialization = spec;
        }
        if (minRating) {
          params.minRating = minRating.toString();
        }
        if (maxFee) {
          params.maxFee = maxFee.toString();
        }
        if (maxDistance && lat !== undefined && lng !== undefined) {
          params.radiusKm = maxDistance.toString();
          params.lat = lat.toString();
          params.lng = lng.toString();
        }
      }

      const response = await expertsApi.getExperts(params);
      let experts = response.data.items.map(mapBackendExpertToFrontend);

      if (filters?.search) {
        const q = filters.search.toLowerCase();
        experts = experts.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            e.clinic.toLowerCase().includes(q),
        );
      }

      return experts;
    },
    enabled,
  });
}

export function useExpertDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.expert(id),
    queryFn: async (): Promise<Expert> => {
      if (appConfig.useMockApi) {
        return expertsMock.getExpertById(id);
      }

      const response = await expertsApi.getExpertById(id);
      return mapBackendExpertToFrontend(response.data);
    },
    enabled: !!id && enabled,
  });
}

export function useSpecialties(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.specialties,
    queryFn: async () => {
      if (appConfig.useMockApi) {
        return expertsMock.getSpecialties();
      }

      return [
        "Trị mụn",
        "Phục hồi da",
        "Sẹo rỗ",
        "Chống lão hóa",
        "Nám & Tàn nhang",
        "Peel da",
      ];
    },
    enabled,
  });
}

export function useExpertMe() {
  return useQuery({
    queryKey: ["expert-me"],
    queryFn: async (): Promise<BackendExpert> => {
      const response = await expertsApi.getMe();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút cache
  });
}
