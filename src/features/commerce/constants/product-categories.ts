/**
 * Canonical definitions for the 6 product categories that Be-Capstone seeds.
 *
 * `code`, `name` and `label` are all join keys: the mapper indexes every one of
 * them, because the BE seed returns some category names in English ("Serum") and
 * others in Vietnamese ("Sữa rửa mặt"). `icon` points at a custom asset under
 * `public/icons/categories/` (file named by the lowercased `code`).
 *
 * Keep `code`/`name` in sync with Be-Capstone's `ProductCategory` enum and the
 * `PRODUCT_CATEGORIES` seed.
 */
export interface CategoryDefinition {
  /** Stable Be-Capstone enum code (ProductCategory). */
  code: string;
  /** English name exactly as Be-Capstone returns it — the match key. */
  name: string;
  /** Vietnamese display label. */
  label: string;
  /** Public path to the custom category icon. */
  icon: string;
}

export const PRODUCT_CATEGORIES: readonly CategoryDefinition[] = [
  {
    code: "CLEANSER",
    name: "Cleanser",
    label: "Sữa rửa mặt",
    icon: "/icons/categories/cleanser.png",
  },
  {
    code: "TONER",
    name: "Toner",
    label: "Nước cân bằng",
    icon: "/icons/categories/toner.png",
  },
  {
    code: "SERUM",
    name: "Serum",
    label: "Tinh chất",
    icon: "/icons/categories/serum.png",
  },
  {
    code: "MOISTURIZER",
    name: "Moisturizer",
    label: "Kem dưỡng ẩm",
    icon: "/icons/categories/moisturizer.png",
  },
  {
    code: "SUNSCREEN",
    name: "Sunscreen",
    label: "Kem chống nắng",
    icon: "/icons/categories/sunscreen.png",
  },
  {
    code: "TREATMENT",
    name: "Treatment",
    // Matches the name the BE seed now uses, so the category resolves either way.
    label: "Sản phẩm đặc trị",
    icon: "/icons/categories/treatment.png",
  },
] as const;
