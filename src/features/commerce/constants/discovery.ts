/** Hand-pinned "featured" ordering. BE has no soldCount/rating and no sort param,
 *  so there is no measurable bestseller signal — the label must stay "Sản phẩm nổi bật",
 *  never "Bán chạy" (faux data is banned by 08-ecommerce-module.md).
 *  Empty by default: the rail then falls back to the API order (newest first) and the
 *  page works before anyone fills real ids in. */
export const FEATURED_PRODUCT_IDS: readonly string[] = [];

export interface SearchSuggestion {
  label: string;
  kind: "query" | "ingredientName";
  value: string;
}

/** Curated because BE has no search analytics endpoint.
 *  Every `ingredientName` value below was checked against GET /ingredients before
 *  merge — BE matches ingredient.name ILIKE '%value%', so a name that does not
 *  exist sends the chip straight into an empty state. */
export const SEARCH_SUGGESTIONS: readonly SearchSuggestion[] = [
  { label: "Retinol", kind: "ingredientName", value: "Retinol" },
  { label: "Niacinamide", kind: "ingredientName", value: "Niacinamide" },
  { label: "Vitamin C", kind: "ingredientName", value: "Vitamin C" },
  { label: "BHA", kind: "ingredientName", value: "Salicylic Acid" },
  {
    label: "Hyaluronic Acid",
    kind: "ingredientName",
    value: "Hyaluronic Acid",
  },
  { label: "Kem chống nắng", kind: "query", value: "chống nắng" },
  { label: "Da dầu mụn", kind: "query", value: "da dầu" },
  { label: "Phục hồi hàng rào da", kind: "query", value: "phục hồi" },
];

/** BE returns no brand logo, so a bento tile shows the initial on an accent.
 *  Keyed by the brandName BE returns; unknown brands fall back rather than
 *  rendering a blank tile when the seed grows. */
export const BRAND_ACCENTS: Readonly<Record<string, string>> = {
  CeraVe: "#2F6FB5",
  "La Roche-Posay": "#3B7A5C",
  "The Ordinary": "#5A5F6B",
  "Paula's Choice": "#B4761F",
  "Some By Mi": "#A34E7A",
};

export const BRAND_ACCENT_FALLBACK = "#3B7A5C";

export function getBrandAccent(brandName: string): string {
  return BRAND_ACCENTS[brandName] ?? BRAND_ACCENT_FALLBACK;
}
