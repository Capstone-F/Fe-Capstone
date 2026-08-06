import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { bookingApi } from "../api/booking.api";
import { mapBackendBookingToFrontend } from "../mapper/booking-mapper";
import type { TimeSlot } from "../types/booking.types";

const MIN_BOOKING_LEAD_TIME_MS = 2 * 60 * 60 * 1000; // 2 hours

export function isSlotBookable(slotDateTimeISO: string): boolean {
  const slotTime = new Date(slotDateTimeISO).getTime();
  const minValidTime = Date.now() + MIN_BOOKING_LEAD_TIME_MS;
  return slotTime >= minValidTime;
}

export function useSlots(expertId: string, anchorDate?: string) {
  const targetDate = anchorDate || new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["slots", expertId, targetDate],
    queryFn: async () => {
      const response = await bookingApi.getSlots(expertId, targetDate, "week");
      const slots: TimeSlot[] = [];

      response.data.days.forEach((day) => {
        day.slots.forEach((s) => {
          if (isSlotBookable(s.startAt)) {
            slots.push({
              id: `${expertId}_${s.startAt}`,
              expertId,
              dateTime: s.startAt,
              isBooked: !s.available,
            });
          }
        });
      });

      return slots;
    },
    enabled: !!expertId,
  });
}

export function useBookings() {
  return useQuery({
    queryKey: queryKeys.bookings,
    queryFn: async () => {
      const response = await bookingApi.getBookings();
      return response.data.items.map(mapBackendBookingToFrontend);
    },
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: async () => {
      try {
        const response = await bookingApi.getBookingById(id);
        return mapBackendBookingToFrontend(response.data);
      } catch {
        const response = await bookingApi.getBookings();
        const bookings = response.data.items.map(mapBackendBookingToFrontend);
        const bk = bookings.find((b) => b.id === id);
        if (!bk) {
          throw new Error(`Đơn đặt lịch ${id} không tồn tại.`);
        }
        return bk;
      }
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      expertId: string;
      expertName: string;
      slotId: string;
      dateTime: string;
      symptoms: string;
      amount: number;
    }) => {
      const response = await bookingApi.createBooking({
        expertId: input.expertId,
        scheduledAt: input.dateTime,
        reason: input.symptoms,
      });

      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function usePayConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await bookingApi.payBooking(bookingId);
      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(data.id) });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
    }: {
      bookingId: string;
      isPaid?: boolean;
    }) => {
      const response = await bookingApi.payBooking(bookingId);
      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(data.id) });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

// ─────────────────────────────────────────────────────────────
// EXPERT HOOKS (For Doctors & Specialists)
// ─────────────────────────────────────────────────────────────

export function useExpertBookings(params?: {
  tab?: "upcoming" | "past" | "cancelled";
  status?: string;
}) {
  return useQuery({
    queryKey: ["expert-bookings", params],
    queryFn: async () => {
      const response = await bookingApi.getExpertBookings(params);
      return response.data.items.map(mapBackendBookingToFrontend);
    },
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bookingApi.confirmBooking(id);
      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await bookingApi.cancelBooking(id, reason);
      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(data.id) });
      queryClient.invalidateQueries({ queryKey: ["expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}

export function useStartBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bookingApi.startBooking(id);
      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bookingApi.completeBooking(id);
      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      rating,
      comment,
    }: {
      id: string;
      rating: number;
      comment?: string;
    }) => {
      const response = await bookingApi.submitFeedback(id, rating, comment);
      return mapBackendBookingToFrontend(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: ["experts"] });
    },
  });
}
