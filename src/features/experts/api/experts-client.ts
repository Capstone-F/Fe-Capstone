import { apiJson } from "@/lib/api/client";
import { appConfig } from "@/lib/env";
import { API_ENDPOINTS } from "@/config/api-endpoints";

import { MOCK_EXPERTS } from "../constants/expert-mock";
import {
  mapBackendExpertToFrontend,
  mapSpecialtyToBackend,
} from "../mapper/expert-mapper";
import type { BackendExpert, Expert, ExpertFilters } from "../types/expert";

export async function getExperts(filters?: ExpertFilters): Promise<Expert[]> {
  if (appConfig.useMockApi) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    let result = [...MOCK_EXPERTS];

    if (filters) {
      const { specialty, search, minRating, maxFee, maxDistance } = filters;

      if (specialty && specialty !== "Tất cả") {
        result = result.filter((e) => e.specialties.includes(specialty));
      }
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q) ||
            e.clinic.toLowerCase().includes(q),
        );
      }
      if (minRating) {
        result = result.filter((e) => e.rating >= minRating);
      }
      if (maxFee) {
        result = result.filter((e) => e.fee <= maxFee);
      }
      if (maxDistance) {
        result = result.filter(
          (e) => e.distance !== undefined && e.distance <= maxDistance,
        );
      }
    }

    return result;
  }

  // Real API Logic
  let url = API_ENDPOINTS.EXPERTS.LIST;
  const queryParams = new URLSearchParams();

  if (filters) {
    const { specialty, minRating, maxFee, maxDistance, lat, lng } = filters;
    if (specialty && specialty !== "Tất cả") {
      const spec = mapSpecialtyToBackend(specialty);
      if (spec) queryParams.set("specialization", spec);
    }
    if (minRating) {
      queryParams.set("minRating", minRating.toString());
    }
    if (maxFee) {
      queryParams.set("maxFee", maxFee.toString());
    }
    if (maxDistance && lat !== undefined && lng !== undefined) {
      queryParams.set("radiusKm", maxDistance.toString());
      queryParams.set("lat", lat.toString());
      queryParams.set("lng", lng.toString());
    }
  }

  const queryString = queryParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  // BE returns PaginatedResponse: { items: ExpertResponseDto[], total: number, page: number, limit: number }
  const response = await apiJson<{ items: BackendExpert[] }>(url);
  let experts = response.items.map(mapBackendExpertToFrontend);

  // Perform search locally as BE doesn't support text query on this endpoint
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    experts = experts.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.clinic.toLowerCase().includes(q),
    );
  }

  return experts;
}

export async function getExpertById(id: string): Promise<Expert> {
  if (appConfig.useMockApi) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const exp = MOCK_EXPERTS.find((e) => e.id === id);
    if (!exp) {
      throw new Error(`Chuyên gia với ID ${id} không tồn tại`);
    }
    return exp;
  }

  const beExpert = await apiJson<BackendExpert>(
    API_ENDPOINTS.EXPERTS.DETAIL(id),
  );
  return mapBackendExpertToFrontend(beExpert);
}

export async function getSpecialties(): Promise<string[]> {
  if (appConfig.useMockApi) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const specialties = new Set<string>();
    MOCK_EXPERTS.forEach((e) =>
      e.specialties.forEach((s) => specialties.add(s)),
    );
    return Array.from(specialties);
  }

  return [
    "Trị mụn",
    "Phục hồi da",
    "Sẹo rỗ",
    "Chống lão hóa",
    "Nám & Tàn nhang",
    "Peel da",
  ];
}
