import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  getExperts,
  getExpertById,
  getSpecialties,
} from "../api/experts-client";

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
    queryFn: () => getExperts(filters),
    enabled,
  });
}

export function useExpertDetail(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.expert(id),
    queryFn: () => getExpertById(id),
    enabled: !!id && enabled,
  });
}

export function useSpecialties(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.specialties,
    queryFn: getSpecialties,
    enabled,
  });
}
