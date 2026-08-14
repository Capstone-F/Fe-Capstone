"use client";

import { useQuery } from "@tanstack/react-query";
import { clinicsApi } from "../api/clinics.api";
import type { ListClinicsQuery } from "../types/clinic.types";
import { queryKeys } from "@/lib/query/keys";

export function useClinics(query?: ListClinicsQuery) {
  return useQuery({
    queryKey: queryKeys.clinics(query),
    queryFn: () => clinicsApi.getClinics(query).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

export function useClinicDetail(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.clinic(id),
    queryFn: () => {
      if (!id) return null;
      return clinicsApi.getClinicById(id).then((res) => res.data);
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useClinicExperts(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.clinicExperts(id),
    queryFn: () => {
      if (!id) return { items: [], total: 0 };
      return clinicsApi.getClinicExperts(id).then((res) => res.data);
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
