import { useQuery } from "@tanstack/react-query";
import {
  provincesApi,
  type Province,
  type Ward,
} from "@/features/experts/api/provinces.api";

export function useProvinces(enabled: boolean = true) {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async (): Promise<Province[]> => {
      const response = await provincesApi.getProvinces();
      return response.data;
    },
    enabled,
  });
}

export function useProvinceWards(
  provinceCode: number | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["provinces", provinceCode, "wards"],
    queryFn: async (): Promise<Ward[]> => {
      const response = await provincesApi.getProvinceWards(
        provinceCode as number,
      );
      return response.data.wards ?? [];
    },
    enabled: enabled && provinceCode !== null,
  });
}
