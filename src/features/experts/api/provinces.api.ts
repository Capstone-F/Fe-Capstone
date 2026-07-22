import { externalApiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";

export type Province = {
  code: number;
  name: string;
};

export type Ward = {
  code: number;
  name: string;
  province_code: number;
};

export type ProvinceDetail = Province & {
  wards?: Ward[];
};

export const provincesApi = {
  getProvinces: (): Promise<AxiosResponse<Province[]>> => {
    return externalApiClient.get<Province[]>(
      `${API_ENDPOINTS.PROVINCES.LIST}p/`,
    );
  },

  getProvinceWards: (
    provinceCode: number,
  ): Promise<AxiosResponse<ProvinceDetail>> => {
    return externalApiClient.get<ProvinceDetail>(
      `${API_ENDPOINTS.PROVINCES.LIST}p/${provinceCode}?depth=2`,
    );
  },
};
