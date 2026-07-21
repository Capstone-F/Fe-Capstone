import { Product, ProductVariant } from "@/types/domain";

/**
 * v1: every onboarded product has exactly one ProductVariant (design doc
 * §1). Picks the first active variant for display price / add-to-cart.
 * No variant-picker UI until products with multiple real variants exist.
 */
export function primaryVariant(product: Product): ProductVariant | undefined {
  return product.variants.find((v) => v.isActive) ?? product.variants[0];
}
