import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
