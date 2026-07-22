import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { appConfig } from "@/lib/env";
import { bookingApi } from "../api/booking.api";
import { bookingMock } from "../api/booking.mock";
import { mapBackendBookingToFrontend } from "../mapper/booking-mapper";
import type { TimeSlot } from "../types/booking.types";

export function useSlots(expertId: string) {
  return useQuery({
    queryKey: queryKeys.slots(expertId),
    queryFn: async () => {
      if (appConfig.useMockApi) {
        return bookingMock.getSlots(expertId);
      }

      const todayStr = new Date().toISOString().split("T")[0];
      const response = await bookingApi.getSlots(expertId, todayStr);
      const slots: TimeSlot[] = [];

      response.data.days.forEach((day) => {
        day.slots.forEach((s) => {
          slots.push({
            id: `${expertId}_${s.startAt}`,
            expertId,
            dateTime: s.startAt,
            isBooked: !s.available,
          });
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
