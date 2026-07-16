import { CartItem, CartSummary, Product, ProductVariant } from "@/types/domain";
import { computeCartSummary } from "./cart-totals";

export type VariantIndex = Map<
  string,
  { product: Product; variant: ProductVariant }
>;

/** Index every product's variants by variant id, for O(1) cart-line lookup. */
export function indexProductVariants(products: Product[]): VariantIndex {
  const index: VariantIndex = new Map();
  for (const product of products) {
    for (const variant of product.variants) {
      index.set(variant.id, { product, variant });
    }
  }
  return index;
}

/**
 * Join raw {productVariantId, quantity} cart items against a product
 * index (fetched via GET /products, see use-cart.ts). CartResponseDto
 * carries no name/price. A variant absent from the index (its product
 * wasn't in the fetched pool) is dropped from `lines` and reported in
 * `unresolvedVariantIds` instead of crashing the render — not a silent bug,
 * see CartSummary.unresolvedVariantIds doc comment.
 */
export function hydrateCart(
  items: CartItem[],
  index: VariantIndex,
): CartSummary {
  const lines = [];
  const unresolvedVariantIds: string[] = [];

  for (const item of items) {
    const match = index.get(item.productVariantId);
    if (!match) {
      unresolvedVariantIds.push(item.productVariantId);
      continue;
    }
    lines.push({
      product: match.product,
      variant: match.variant,
      quantity: item.quantity,
      lineTotal: match.variant.priceVnd * item.quantity,
    });
  }

  return computeCartSummary(lines, unresolvedVariantIds);
}
