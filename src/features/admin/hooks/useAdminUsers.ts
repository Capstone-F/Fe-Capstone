import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
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
    placeholderData: keepPreviousData,
  });
}

export function useAdminUserDirectory(params: {
  q?: string;
  role?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin-user-directory", params],
    queryFn: async () => (await adminUsersApi.getUsers(params)).data,
    placeholderData: keepPreviousData,
  });
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => (await adminUsersApi.getUser(id)).data,
    enabled: Boolean(id),
  });
}

export function useAdminWallet(userId: string) {
  return useQuery({
    queryKey: ["admin-wallet", userId],
    queryFn: async () => (await adminUsersApi.getWallet(userId)).data,
    enabled: Boolean(userId),
  });
}

export function useUpdateAdminUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roles }: { id: string; roles: string[] }) =>
      (await adminUsersApi.updateRoles(id, roles)).data,
    onSuccess: (user) => {
      queryClient.setQueryData(["admin-user", user.id], user);
      void queryClient.invalidateQueries({
        queryKey: ["admin-user-directory"],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useUpdateAdminUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await adminUsersApi.updateStatus(id, isActive)).data,
    onSuccess: (user) => {
      queryClient.setQueryData(["admin-user", user.id], user);
      void queryClient.invalidateQueries({
        queryKey: ["admin-user-directory"],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({ queryKey: ["experts"] });
      void queryClient.invalidateQueries({
        queryKey: ["expert-profiles-by-email"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["expert-cancellation-stats"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["expert-cancellation-reports"],
      });
    },
  });
}

export function useAdminWalletTopUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      amountVnd,
      note,
    }: {
      userId: string;
      amountVnd: number;
      note?: string;
    }) => (await adminUsersApi.topUpWallet(userId, amountVnd, note)).data,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({
        queryKey: ["admin-wallet", result.userId],
      });
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
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin-user-directory"],
      });
      void queryClient.invalidateQueries({ queryKey: ["experts"] });
    },
  });
}

export function useCreateExpert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: CreateManagedUserPayload & {
        specialization: string;
        consultationFee: number;
      },
    ) => {
      if (!payload.clinicId) {
        throw new Error("Phải chọn phòng khám cho bác sĩ.");
      }

      const { consultationFee, specialization, ...userPayload } = payload;
      const userResponse = await adminUsersApi.createUser(userPayload);

      await adminUsersApi.createExpertProfile({
        userId: userResponse.data.id,
        clinicId: payload.clinicId,
        specialization,
        consultationFee,
      });

      return userResponse.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      void queryClient.invalidateQueries({
        queryKey: ["admin-user-directory"],
      });
      void queryClient.invalidateQueries({ queryKey: ["experts"] });
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
