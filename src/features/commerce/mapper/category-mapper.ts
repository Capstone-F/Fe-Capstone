import {
  PRODUCT_CATEGORIES,
  type CategoryDefinition,
} from "../constants/product-categories";

// Index the constant by normalized English name so a BE category `name` can be
// matched in O(1). Normalization (trim + lowercase) guards against incidental
// casing/whitespace differences from the API.
const BY_NAME: ReadonlyMap<string, CategoryDefinition> = new Map(
  PRODUCT_CATEGORIES.map((category) => [
    category.name.trim().toLowerCase(),
    category,
  ]),
);

/** Resolve the full definition for a BE category `name` (undefined if unknown). */
export function findCategory(beName: string): CategoryDefinition | undefined {
  return BY_NAME.get(beName.trim().toLowerCase());
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
