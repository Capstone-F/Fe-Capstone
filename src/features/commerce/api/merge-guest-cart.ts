import { CartItem } from "@/types/domain";
import { addToCart, getCartItems } from "../api/cart-client";
import { getAllProducts } from "../api/products-client";
import { indexProductVariants } from "../mapper/cart-hydration";
import { partitionGuestCartItems } from "@/features/commerce/lib/guest-cart-merge";

/**
 * Push each guest cart line to the server cart. For a variant that already
 * has a server-side quantity, merge with the max of the two (never shrinks
 * what's already on the server, and avoids over-counting from possibly-stale
 * guest data) — product decision, 18 Jul 2026. Sequential (not parallel) so
 * the BE processes upserts deterministically and the shared
 * customer-provision guard runs on the first call.
 */
export async function mergeGuestCartIntoServer(
  items: CartItem[],
): Promise<{ droppedVariantIds: string[] }> {
  const productPool = await getAllProducts();
  const validVariantIds = new Set(indexProductVariants(productPool).keys());
  const { mergeableItems, staleVariantIds } = partitionGuestCartItems(
    items,
    validVariantIds,
  );

  if (mergeableItems.length === 0) {
    return { droppedVariantIds: staleVariantIds };
  }

  const serverItems = await getCartItems();
  const serverQtyByVariant = new Map(
    serverItems.map((item) => [item.productVariantId, item.quantity]),
  );

  for (const item of mergeableItems) {
    const serverQty = serverQtyByVariant.get(item.productVariantId) ?? 0;
    const mergedQty = Math.max(item.quantity, serverQty);
    await addToCart(item.productVariantId, mergedQty);
  }

  return { droppedVariantIds: staleVariantIds };
}
