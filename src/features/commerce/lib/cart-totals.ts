import { CartLine, CartSummary } from "@/types/domain";

export const FREE_SHIP_THRESHOLD = 500000;
export const SHIPPING_FEE = 30000;

/** Compute subtotal / shipping / total for a set of hydrated cart lines. */
export function computeCartSummary(lines: CartLine[]): CartSummary {
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  return {
    lines,
    subtotal,
    shippingFee,
    total: subtotal + shippingFee,
    itemCount,
  };
}
