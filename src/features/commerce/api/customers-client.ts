import { apiJson } from "@/lib/api/client";

interface CustomerProfileResponse {
  customer: { id: string } | null;
}

/**
 * Be-Capstone auto-creates the Customer row only on the first
 * PATCH /customers/me (getOrCreateCustomerByUserId) — cart/orders/payments
 * 403 "No customer profile for this user" until it exists. Call once
 * before the first cart operation in a session. Never unconditionally
 * PATCH — an existing customer's allergyLabelCodes must not be wiped.
 */
export async function ensureCustomerProvisioned(): Promise<void> {
  const profile = await apiJson<CustomerProfileResponse>("/customers/me");
  if (profile.customer !== null) {
    return;
  }
  await apiJson("/customers/me", {
    method: "PATCH",
    body: { allergyLabelCodes: [] },
  });
}
