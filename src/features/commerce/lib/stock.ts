import { CartLine } from "@/types/domain";

export interface StockIssue {
  productId: string;
  name: string;
}

/**
 * Pre-checkout stock check (business rule 08): flag any line that is out of
 * stock or requests more than is on hand.
 */
export function checkStock(lines: CartLine[]): StockIssue[] {
  return lines
    .filter(
      (line) =>
        line.product.stockStatus === "out_of_stock" ||
        line.product.quantityOnHand < line.quantity,
    )
    .map((line) => ({ productId: line.product.id, name: line.product.name }));
}
