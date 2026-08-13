import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  clinicExpertsApi,
  ListClinicExpertsQuery,
  CreateExpertUserDto,
  CreateExpertProfileDto,
  UpdateExpertProfileDto,
  ExpertAvailabilitySlot,
} from "../api/clinic-experts.api";
import { toast } from "sonner";

export function useClinicExperts(query?: ListClinicExpertsQuery) {
  return useQuery({
    queryKey: ["clinic-experts", query],
    queryFn: async () => {
      const res = await clinicExpertsApi.getClinicExperts(query);
      return res.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      user: CreateExpertUserDto;
      profile: Omit<CreateExpertProfileDto, "userId">;
    }) => {
      // Step 1: Create User
      const userRes = await clinicExpertsApi.createUser(payload.user);
      const userId = userRes.data.id;
      // Step 2: Create Expert Profile
      const profileRes = await clinicExpertsApi.createProfile({
        ...payload.profile,
        userId,
      });
      return profileRes.data;
    },
    onSuccess: () => {
      toast.success("Tạo tài khoản và hồ sơ Chuyên gia thành công!");
      queryClient.invalidateQueries({ queryKey: ["clinic-experts"] });
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      toast.error(msg || "Không thể tạo Chuyên gia mới.");
    },
  });
}

export function useUpdateExpertProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateExpertProfileDto }) =>
      clinicExpertsApi.updateProfile(id, dto),
    onSuccess: () => {
      toast.success("Cập nhật thông tin Chuyên gia thành công!");
      queryClient.invalidateQueries({ queryKey: ["clinic-experts"] });
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      toast.error(msg || "Cập nhật thất bại.");
    },
  });
}

export function useUpdateConsultationFee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      consultationFee,
    }: {
      id: string;
      consultationFee: number;
    }) => clinicExpertsApi.updateConsultationFee(id, consultationFee),
    onSuccess: () => {
      toast.success("Cập nhật phí tư vấn thành công!");
      queryClient.invalidateQueries({ queryKey: ["clinic-experts"] });
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      toast.error(msg || "Cập nhật phí thất bại.");
    },
  });
}

export function useExpertAvailability(expertId: string | null) {
  return useQuery({
    queryKey: ["expert-availability", expertId],
    queryFn: async () => {
      if (!expertId) return [];
      const res = await clinicExpertsApi.getAvailability(expertId);
      const raw = res.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray((raw as { items?: ExpertAvailabilitySlot[] })?.items))
        return (raw as { items: ExpertAvailabilitySlot[] }).items;
      if (Array.isArray((raw as { data?: ExpertAvailabilitySlot[] })?.data))
        return (raw as { data: ExpertAvailabilitySlot[] }).data;
      return [];
    },
    enabled: Boolean(expertId),
  });
}

export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      expertId,
      slot,
    }: {
      expertId: string;
      slot: Omit<ExpertAvailabilitySlot, "id" | "expertId">;
    }) => clinicExpertsApi.createAvailability(expertId, slot),
    onSuccess: (_, variables) => {
      toast.success("Thêm khung giờ làm việc thành công!");
      queryClient.invalidateQueries({
        queryKey: ["expert-availability", variables.expertId],
      });
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      toast.error(msg || "Không thể thêm khung giờ.");
    },
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expertId, slotId }: { expertId: string; slotId: string }) =>
      clinicExpertsApi.deleteAvailability(expertId, slotId),
    onSuccess: (_, variables) => {
      toast.success("Xóa khung giờ làm việc thành công!");
      queryClient.invalidateQueries({
        queryKey: ["expert-availability", variables.expertId],
      });
    },
    onError: (err: unknown) => {
      const msg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message || (err as Error)?.message;
      toast.error(msg || "Không thể xóa khung giờ.");
    },
  });
}
