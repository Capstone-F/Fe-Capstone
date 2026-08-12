import {
  PRODUCT_CATEGORIES,
  type CategoryDefinition,
} from "../constants/product-categories";

// Index every string a category is known by — code, English name and Vietnamese
// label — so the lookup survives the BE renaming its category `name`. It already
// did once: four of the six seeds now come back Vietnamese ("Sữa rửa mặt" rather
// than "Cleanser"), which silently cost those categories their icon. Products
// only carry `categoryName`, never the stable code, so matching on one spelling
// is not enough. Normalization (trim + lowercase) guards against casing and
// whitespace differences.
const BY_KEY: ReadonlyMap<string, CategoryDefinition> = new Map(
  PRODUCT_CATEGORIES.flatMap((category) =>
    [category.code, category.name, category.label].map(
      (key): [string, CategoryDefinition] => [
        key.trim().toLowerCase(),
        category,
      ],
    ),
  ),
);

/**
 * Resolve the full definition from any of a category's known spellings — the BE
 * `name` (English or Vietnamese), the enum `code`, or the Vietnamese label.
 */
export function findCategory(beName: string): CategoryDefinition | undefined {
  return BY_KEY.get(beName.trim().toLowerCase());
}

/**
 * Vietnamese label for a BE category `name`. Matches the API `name` against the
 * constant and returns the mapped `label`; falls back to the raw name when the
 * category is unknown (e.g. a new BE category not yet added to the constant).
 */
export function getCategoryLabel(beName: string): string {
  return findCategory(beName)?.label ?? beName;
}

/** Custom icon path for a BE category `name` (undefined if unknown). */
export function getCategoryIcon(beName: string): string | undefined {
  return findCategory(beName)?.icon;
}
