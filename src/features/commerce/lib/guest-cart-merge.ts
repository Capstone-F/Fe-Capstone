import type { CartItem } from "@/types/domain";

export function partitionGuestCartItems(
  items: CartItem[],
  validVariantIds: Set<string>,
) {
  const mergeableItems: CartItem[] = [];
  const staleVariantIds: string[] = [];

  for (const item of items) {
    if (validVariantIds.has(item.productVariantId)) {
      mergeableItems.push(item);
      continue;
    }

    staleVariantIds.push(item.productVariantId);
  }

  return { mergeableItems, staleVariantIds };
}
