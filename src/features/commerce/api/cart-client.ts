import { CartItem, CartLine, CartSummary } from "@/types/domain";
import { MOCK_PRODUCTS } from "../data/mock-catalog";
import { computeCartSummary } from "../lib/cart-totals";

const CART_KEY = "glowscan_cart_v1";

function readRaw(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeRaw(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function hydrate(items: CartItem[]): CartLine[] {
  return items
    .map((item) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity,
        lineTotal: product.priceVnd * item.quantity,
      } satisfies CartLine;
    })
    .filter((line): line is CartLine => line !== null);
}

export async function getCart(): Promise<CartSummary> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return computeCartSummary(hydrate(readRaw()));
}

export async function addToCart(
  productId: string,
  quantity = 1,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const items = readRaw();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }
  writeRaw(items);
}

export async function updateQuantity(
  productId: string,
  quantity: number,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  let items = readRaw();
  if (quantity <= 0) {
    items = items.filter((i) => i.productId !== productId);
  } else {
    const existing = items.find((i) => i.productId === productId);
    if (existing) existing.quantity = quantity;
  }
  writeRaw(items);
}

export async function removeFromCart(productId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  writeRaw(readRaw().filter((i) => i.productId !== productId));
}

export async function clearCart(): Promise<void> {
  writeRaw([]);
}
