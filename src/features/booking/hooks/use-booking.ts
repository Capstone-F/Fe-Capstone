import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  getSlots,
  createBooking,
  getBookings,
  getBookingById,
  payConsultation,
  updatePaymentStatus,
} from "../api/booking-client";

export function useSlots(expertId: string) {
  return useQuery({
    queryKey: queryKeys.slots(expertId),
    queryFn: () => getSlots(expertId),
    enabled: !!expertId,
  });
}

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: getBookings,
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function usePayConsultation() {
  return useMutation({
    mutationFn: payConsultation,
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: "paid" | "pending";
    }) => updatePaymentStatus(bookingId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(data.id) });
    },
  });
}
