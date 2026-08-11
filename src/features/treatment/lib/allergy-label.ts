import type { AllergyLabelResponse } from "../types/profile.types";

const ALLERGY_LABELS_VI: Record<string, string> = {
  ALCOHOL: "Cồn khô",
  BENZOYL_PEROXIDE: "Peroxit benzoyl (BPO)",
  ESSENTIAL_OIL: "Tinh dầu thực vật",
  FRAGRANCE: "Hương liệu",
  LANOLIN: "Mỡ cừu (lanolin)",
  NIACINAMIDE: "Niacinamide (vitamin B3)",
  RETINOIDS: "Retinoid (retinol/tretinoin)",
  SALICYLIC_ACID: "Axit salicylic (BHA)",
  VITAMIN_C: "Vitamin C",
};

export function getAllergyLabel(option: AllergyLabelResponse): string {
  return (
    option.vietnameseNormalized?.trim() ||
    ALLERGY_LABELS_VI[option.code] ||
    option.name
  );