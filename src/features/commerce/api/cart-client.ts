import { apiJson } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

import type { CartItem, CartResponse } from "../types/cart";
import { ensureCustomerProvisioned } from "./customers-client";

let provisioned = false;

async function ensureProvisionedOnce(): Promise<void> {
  if (provisioned) return;
  await ensureCustomerProvisioned();
  provisioned = true;
}

export async function getCartItems(): Promise<CartItem[]> {
  await ensureProvisionedOnce();
  const response = await apiJson<CartResponse>(API_ENDPOINTS.CART.GET);
  return response.items;
}

/**
 * `source: "CATALOG"` is required on every call (Be-Capstone validates it
 * per-request, not just on first add). The SURVEY cart source belongs to
 * the /scan flow, out of scope here (design doc §3/§6) — mixing sources
 * on an existing SURVEY cart would 400, by BE design.
 */
export async function addToCart(
  productVariantId: string,
  quantity = 1,
  source: "CATALOG" | "SURVEY" = "CATALOG",
  surveyRecommendationId?: string,
): Promise<CartItem[]> {
  await ensureProvisionedOnce();
  const response = await apiJson<CartResponse>(API_ENDPOINTS.CART.ITEMS, {
    method: "POST",
    body: {
      productVariantId,
      quantity,
      source,
      ...(surveyRecommendationId ? { surveyRecommendationId } : {}),
    },
  });
  return response.items;
}

/** Be-Capstone overwrites quantity on POST /cart/items for an existing
 * variant (not increment) — so "set quantity" reuses addToCart directly. */
export async function updateQuantity(
  productVariantId: string,
  quantity: number,
  source?: "CATALOG" | "SURVEY",
  surveyRecommendationId?: string,
): Promise<CartItem[]> {
  if (quantity <= 0) {
    return removeFromCart(productVariantId);
  }

  let finalSource = source;
  let finalRecId = surveyRecommendationId;

  if (!finalSource) {
    try {
      const response = await apiJson<CartResponse>(API_ENDPOINTS.CART.GET);
      finalSource = response.source || "CATALOG";
      finalRecId = response.surveyRecommendationId || undefined;
    } catch {
      finalSource = "CATALOG";
    }
  }

  return addToCart(productVariantId, quantity, finalSource, finalRecId);
}

export async function removeFromCart(
  productVariantId: string,
): Promise<CartItem[]> {
  await ensureProvisionedOnce();
  const response = await apiJson<CartResponse>(
    API_ENDPOINTS.CART.ITEM(productVariantId),
    { method: "DELETE" },
  );
  return response.items;
}

export async function clearCart(): Promise<void> {
  await ensureProvisionedOnce();
  await apiJson<CartResponse>(API_ENDPOINTS.CART.GET, { method: "DELETE" });
}
