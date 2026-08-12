import type { BackendExpert, Expert } from "../types/expert.types";

export function translateSpecialization(spec: string): string {
  switch (spec) {
    case "DERMATOLOGY":
      return "Da liễu tổng quát";
    case "COSMETIC_DERMATOLOGY":
      return "Phục hồi da";
    case "ACNE_TREATMENT":
      return "Trị mụn";
    case "ANTI_AGING":
      return "Chống lão hóa";
    case "PIGMENTATION":
      return "Nám & Tàn nhang";
    case "LASER_THERAPY":
      return "Sẹo rỗ";
    case "AESTHETIC_MEDICINE":
      return "Peel da";
    default:
      return spec;
  }
}

export function mapSpecialtyToBackend(specialty: string): string | null {
  switch (specialty) {
    case "Trị mụn":
      return "ACNE_TREATMENT";
    case "Phục hồi da":
      return "COSMETIC_DERMATOLOGY";
    case "Chống lão hóa":
      return "ANTI_AGING";
    case "Nám & Tàn nhang":
      return "PIGMENTATION";
    case "Sẹo rỗ":
      return "LASER_THERAPY";
    case "Peel da":
      return "AESTHETIC_MEDICINE";
    case "Da liễu tổng quát":
      return "DERMATOLOGY";
    default:
      return null;
  }
}

export function mapBackendExpertToFrontend(be: BackendExpert): Expert {
  return {
    id: be.id,
    name: be.name || "Chuyên gia da liễu",
    title: translateSpecialization(be.specialization),
    clinic: be.clinicName || "Trung tâm chăm sóc da GlowScan Partner",
    rating: Number(be.rating) || 0,
    reviews: 0,
    fee: Number(be.consultationFee) || 0,
    specialties: [translateSpecialization(be.specialization)],
    distance: be.distanceKm !== null ? Number(be.distanceKm) : undefined,
    bio: be.bio || "",
  };
}
