import { API_ENDPOINTS } from "@/config/api-endpoints";

export type Province = {
  code: number;
  name: string;
};

export type Ward = {
  code: number;
  name: string;
  province_code: number;
};

type ProvinceDetail = Province & {
  wards?: Ward[];
};

async function readProvincesJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "force-cache" });

  if (!response.ok) {
    throw new Error("Không thể tải dữ liệu địa giới hành chính.");
  }

  return (await response.json()) as T;
}

export async function getProvinces(): Promise<Province[]> {
  return readProvincesJson<Province[]>(`${API_ENDPOINTS.PROVINCES.LIST}p/`);
}

export async function getProvinceWards(provinceCode: number): Promise<Ward[]> {
  const province = await readProvincesJson<ProvinceDetail>(
    `${API_ENDPOINTS.PROVINCES.LIST}p/${provinceCode}?depth=2`,
  );

  return province.wards ?? [];
}
