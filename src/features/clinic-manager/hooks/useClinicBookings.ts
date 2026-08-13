import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  clinicBookingsApi,
  ListClinicBookingsQuery,
} from "../api/clinic-bookings.api";

export function useClinicBookings(query?: ListClinicBookingsQuery) {
  return useQuery({
    queryKey: ["clinic-bookings", query],
    queryFn: async () => {
      const res = await clinicBookingsApi.getClinicBookings(query);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useClinicBookingDetail(id: string | null) {
  return useQuery({
    queryKey: ["clinic-booking-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await clinicBookingsApi.getClinicBookingDetail(id);
      return res.data;
    },
    enabled: Boolean(id),
  });
}
