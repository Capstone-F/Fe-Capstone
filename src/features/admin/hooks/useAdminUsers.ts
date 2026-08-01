import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/features/booking/api/booking.api";
import {
  adminUsersApi,
  type CreateManagedUserPayload,
} from "../api/admin-users.api";

export function useClinics() {
  return useQuery({
    queryKey: ["admin-clinics"],
    queryFn: async () => {
      const response = await adminUsersApi.getClinics();
      return response.data.items || [];
    },
  });
}

export function useAdminUsers(params?: { role?: string; clinicId?: string }) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const response = await adminUsersApi.getUsers(params);
      return response.data.items || [];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateManagedUserPayload) => {
      const response = await adminUsersApi.createUser(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["experts"] });
    },
  });
}

export function useCreateExpert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateManagedUserPayload & { specialization: string },
    ) => {
      if (!payload.clinicId) {
        throw new Error("Phải chọn phòng khám cho bác sĩ.");
      }

      const { specialization, ...userPayload } = payload;
      const userResponse = await adminUsersApi.createUser(userPayload);

      await adminUsersApi.createExpertProfile({
        userId: userResponse.data.id,
        clinicId: payload.clinicId,
        specialization,
      });

      return userResponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["experts"] });
    },
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      try {
        const response = await adminUsersApi.getCustomers();
        return response.data.items || [];
      } catch {
        return [];
      }
    },
  });
}

export function useAdminQuickBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      expertId: string;
      scheduledAt: string;
      reason?: string;
    }) => {
      const response = await bookingApi.createBooking({
        expertId: payload.expertId,
        scheduledAt: payload.scheduledAt,
        reason: payload.reason || "Lịch tư vấn chăm sóc da",
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expert-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
