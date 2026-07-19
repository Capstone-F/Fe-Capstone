import { CartItem } from "@/types/domain";

// localStorage key for the logged-out (guest) cart. Value is a JSON array of
// CartItem — deliberately the same shape the server /cart returns, so the
// existing hydrateCart() works on it unchanged.
const GUEST_CART_KEY = "glowscan_guest_cart";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function writeGuestCart(items: CartItem[]): CartItem[] {
  if (isBrowser()) {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  }
  return items;
}

/** Read the guest cart. Returns [] on SSR, missing, or malformed JSON. */
export function readGuestCart(): CartItem[] {
  if (!isBrowser()) {
    return [];
  }
  const raw = window.localStorage.getItem(GUEST_CART_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).productVariantId === "string" &&
        typeof (item as CartItem).quantity === "number",
    );
  } catch {
    return [];
  }
}

/**
 * Upsert a line using an ABSOLUTE quantity (matches BE POST /cart/items
 * overwrite semantics). Existing line for the variant is replaced, not summed.
 */
export function addGuestItem(
  productVariantId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) {
    return removeGuestItem(productVariantId);
  }
  const items = readGuestCart();
  const existing = items.find((i) => i.productVariantId === productVariantId);
  if (existing) {
    existing.quantity = quantity;
    return writeGuestCart(items);
  }
  return writeGuestCart([...items, { productVariantId, quantity }]);
}

/** Set an exact quantity; quantity <= 0 removes the line. */
export function setGuestQty(
  productVariantId: string,
  quantity: number,
): CartItem[] {
  return addGuestItem(productVariantId, quantity);
}

export function removeGuestItem(productVariantId: string): CartItem[] {
  const items = readGuestCart().filter(
    (i) => i.productVariantId !== productVariantId,
  );
  return writeGuestCart(items);
}

export function clearGuestCart(): void {
  if (isBrowser()) {
    window.localStorage.removeItem(GUEST_CART_KEY);
  }
}
