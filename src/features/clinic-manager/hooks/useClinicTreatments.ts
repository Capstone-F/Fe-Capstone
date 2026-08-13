import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  clinicTreatmentsApi,
  ListClinicTreatmentsQuery,
} from "../api/clinic-treatments.api";

export function useClinicTreatments(query?: ListClinicTreatmentsQuery) {
  return useQuery({
    queryKey: ["clinic-treatments", query],
    queryFn: async () => {
      const res = await clinicTreatmentsApi.getClinicTreatments(query);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useClinicTreatmentDetail(id: string | null) {
  return useQuery({
    queryKey: ["clinic-treatment-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await clinicTreatmentsApi.getClinicTreatmentDetail(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}
