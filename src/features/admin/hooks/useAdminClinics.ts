"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminClinicsApi,
  type CreateAdminClinicDto,
  type ListAdminClinicsQuery,
} from "../api/admin-clinics.api";

export function useAdminClinics(query?: ListAdminClinicsQuery) {
  return useQuery({
    queryKey: ["admin-clinics", query],
    queryFn: () => adminClinicsApi.getClinics(query).then((res) => res.data),
    staleTime: 60 * 1000,
  });
}

export function useCreateAdminClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateAdminClinicDto) =>
      adminClinicsApi.createClinic(body),
    onSuccess: () => {
      toast.success("Thêm phòng khám đối tác thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể tạo phòng khám";
      toast.error(msg);
    },
  });
}

export function useUpdateAdminClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<CreateAdminClinicDto>;
    }) => adminClinicsApi.updateClinic(id, body),
    onSuccess: () => {
      toast.success("Cập nhật thông tin phòng khám thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể cập nhật phòng khám";
      toast.error(msg);
    },
  });
}

export function useDeactivateAdminClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminClinicsApi.deactivateClinic(id),
    onSuccess: () => {
      toast.success("Đã tạm ngừng hoạt động phòng khám thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Không thể tạm ngừng hoạt động phòng khám";
      toast.error(msg);
    },
  });
}

export function useUpdateClinicCommission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, percent }: { id: string; percent: number }) =>
      adminClinicsApi.updateCommission(id, percent),
    onSuccess: () => {
      toast.success("Đã cập nhật tỷ lệ hoa hồng của phòng khám");
      queryClient.invalidateQueries({ queryKey: ["admin-clinics"] });
    },
    onError: (err: unknown) => {
      const message = (
        err as { response?: { data?: { message?: string | string[] } } }
      )?.response?.data?.message;
      toast.error(
        Array.isArray(message)
          ? message.join(". ")
          : message || "Không thể cập nhật tỷ lệ hoa hồng",
      );
    },
  });
}
