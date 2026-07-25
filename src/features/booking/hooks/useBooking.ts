import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { appConfig } from "@/lib/env";
import { bookingApi } from "../api/booking.api";
import { bookingMock } from "../api/booking.mock";
import { mapBackendBookingToFrontend } from "../mapper/booking-mapper";
import type { TimeSlot } from "../types/booking.types";

const MIN_BOOKING_LEAD_TIME_MS = 2 * 60 * 60 * 1000; // 2 hours

export function isSlotBookable(slotDateTimeISO: string): boolean {
  const slotTime = new Date(slotDateTimeISO).getTime();
  const minValidTime = Date.now() + MIN_BOOKING_LEAD_TIME_MS;
  return slotTime >= minValidTime;
}

export function useSlots(expertId: string) {
  return useQuery({
    queryKey: queryKeys.slots(expertId),
    queryFn: async () => {
      if (appConfig.useMockApi) {
        const allMockSlots = await bookingMock.getSlots(expertId);
        return allMockSlots.filter((s) => isSlotBookable(s.dateTime));
      }

      const todayStr = new Date().toISOString().split("T")[0];
      const response = await bookingApi.getSlots(expertId, todayStr);
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
      if (appConfig.useMockApi) {
        return bookingMock.getBookings();
      }

      const response = await bookingApi.getBookings();
      return response.data.items.map(mapBackendBookingToFrontend);
    },
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.booking(id),
    queryFn: async () => {
      if (appConfig.useMockApi) {
        return bookingMock.getBookingById(id);
      }

      // Real API Logic: Filter from active bookings
      const response = await bookingApi.getBookings();
      const bookings = response.data.items.map(mapBackendBookingToFrontend);
      const bk = bookings.find((b) => b.id === id);
      if (!bk) {
        throw new Error(`Đơn đặt lịch ${id} không tồn tại.`);
      }
      return bk;
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
      if (appConfig.useMockApi) {
        return bookingMock.createBooking(input);
      }

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
  return useMutation({
    mutationFn: (bookingId: string) => bookingMock.payConsultation(bookingId),
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: "paid" | "pending";
    }) => {
      if (appConfig.useMockApi) {
        return bookingMock.updatePaymentStatus(bookingId, status);
      }

      // Real API Logic: Fetch bookings and find
      const response = await bookingApi.getBookings();
      const bookings = response.data.items.map(mapBackendBookingToFrontend);
      const bk = bookings.find((b) => b.id === bookingId);
      if (!bk) {
        throw new Error(`Đơn đặt lịch ${bookingId} không tồn tại.`);
      }
      return bk;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
      queryClient.invalidateQueries({ queryKey: queryKeys.booking(data.id) });
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
      if (appConfig.useMockApi) {
        return bookingMock.getBookings();
      }

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
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
