import type { Expert, ExpertFilters } from "../types/expert.types";
import { MOCK_EXPERTS } from "../constants/expert-mock";

export const expertsMock = {
  getExperts: async (filters?: ExpertFilters): Promise<Expert[]> => {
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
  },

  getExpertById: async (id: string): Promise<Expert> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const exp = MOCK_EXPERTS.find((e) => e.id === id);
    if (!exp) {
      throw new Error(`Chuyên gia với ID ${id} không tồn tại`);
    }
    return exp;
  },

  getSpecialties: async (): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const specialties = new Set<string>();
    MOCK_EXPERTS.forEach((e) =>
      e.specialties.forEach((s) => specialties.add(s)),
    );
    return Array.from(specialties);
  },
};
