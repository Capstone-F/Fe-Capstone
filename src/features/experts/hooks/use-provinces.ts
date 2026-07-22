import { useQuery } from "@tanstack/react-query";

import {
  getProvinces,
  getProvinceWards,
} from "@/features/experts/api/provinces-client";

export function useProvinces(enabled: boolean = true) {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: getProvinces,
    enabled,
  });
}

export function useProvinceWards(
  provinceCode: number | null,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: ["provinces", provinceCode, "wards"],
    queryFn: () => getProvinceWards(provinceCode as number),
    enabled: enabled && provinceCode !== null,
  });
}
