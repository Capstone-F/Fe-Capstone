import type { Product, BrandSummary } from "../types/product.types";

/** Derived from one scan batch, not from the whole catalog — see useBrands. */
export function toBrandSummaries(products: Product[]): BrandSummary[] {
  const byId = new Map<string, BrandSummary>();
  for (const product of products) {
    const existing = byId.get(product.brandId);
    if (existing) {
      existing.productCount += 1;
    } else {
      byId.set(product.brandId, {
        id: product.brandId,
        name: product.brandName,
        productCount: 1,
      });
    }
  }
  return [...byId.values()].sort((a, b) => b.productCount - a.productCount);
}

/** categoryId -> product count within the scan batch. */
export function toCategoryProductCounts(
  products: Product[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of products) {
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
  }
  return counts;
}
