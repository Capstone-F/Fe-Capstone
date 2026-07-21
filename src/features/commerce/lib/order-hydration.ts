import { OrderItem, Product, ProductVariant } from "@/types/domain";
import { VariantIndex } from "../mapper/cart-hydration";

export interface HydratedOrderItem {
  /** The order item id, stable across renders — safe as a React key. */
  id: string;
  productVariantId: string;
  quantity: number;
  /** Historical unit price from the backend, not the current catalog price. */
  unitPriceVnd: number;
  lineTotalVnd: number;
  /** Null when the variant's product is no longer in the catalog. */
  product: Product | null;
  variant: ProductVariant | null;
}

/**
 * Join order items against the product index for display metadata only.
 *
 * Unlike hydrateCart, this NEVER drops an unresolved line. An order is a
 * historical record — omitting a line would misrepresent what was bought, and
 * the totals shown come from the order itself rather than from these lines, so
 * an unresolved line costs a name and nothing else.
 */
export function hydrateOrderItems(
  items: OrderItem[],
  index: VariantIndex,
): HydratedOrderItem[] {
  return items.map((item) => {
    const match = index.get(item.productVariantId);
    return {
      id: item.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      unitPriceVnd: item.unitPriceVnd,
      lineTotalVnd: item.lineTotalVnd,
      product: match?.product ?? null,
      variant: match?.variant ?? null,
    };
  });
}

/**
 * Orders have no code column, so derive a short human-readable one from the
 * UUID. Display only — every API call uses the full id.
 */
export function formatOrderCode(orderId: string): string {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}
