import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  getExperts,
  getExpertById,
  getSpecialties,
} from "../api/experts-client";

export function useExperts(filters?: {
  specialty?: string;
  search?: string;
  minRating?: number;
  maxFee?: number;
  maxDistance?: number;
}) {
  return useQuery({
    queryKey: queryKeys.experts(filters),
    queryFn: () => getExperts(filters),
  });
}

export function useExpertDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.expert(id),
    queryFn: () => getExpertById(id),
    enabled: !!id,
  });
}

export function useSpecialties() {
  return useQuery({
    queryKey: queryKeys.specialties,
    queryFn: getSpecialties,
  });
}
