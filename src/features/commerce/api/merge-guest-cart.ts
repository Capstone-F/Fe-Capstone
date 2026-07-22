import { CartItem } from "@/types/domain";
import { cartApi } from "../api/cart.api";
import { productsApi } from "../api/products.api";
import { indexProductVariants } from "../mapper/cart-hydration";
import { partitionGuestCartItems } from "@/features/commerce/lib/guest-cart-merge";

const CATALOG_PAGE_SIZE = 100;
async function getAllProducts() {
  const firstResponse = await productsApi.getProducts({
    page: 1,
    limit: CATALOG_PAGE_SIZE,
  });
  const first = firstResponse.data;
  const pageCount = Math.ceil(first.total / CATALOG_PAGE_SIZE);
  const products = first.items.map((item) => item.product);
  if (pageCount <= 1) return products;

  const restResponses = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, i) =>
      productsApi.getProducts({ page: i + 2, limit: CATALOG_PAGE_SIZE }),
    ),
  );
  return [
    ...products,
    ...restResponses.flatMap((res) =>
      res.data.items.map((item) => item.product),
    ),
  ];
}

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

  const serverCartResponse = await cartApi.getCart();
  const serverItems = serverCartResponse.data.items;
  const serverQtyByVariant = new Map<string, number>(
    serverItems.map((item: CartItem) => [item.productVariantId, item.quantity]),
  );

  for (const item of mergeableItems) {
    const serverQty = serverQtyByVariant.get(item.productVariantId) ?? 0;
    const mergedQty = Math.max(item.quantity, serverQty);
    await cartApi.addToCart(item.productVariantId, mergedQty, "CATALOG");
  }

  return { droppedVariantIds: staleVariantIds };
}
