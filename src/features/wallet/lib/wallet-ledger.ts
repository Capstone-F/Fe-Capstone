import type { Wallet } from "../types/wallet.types";

/**
 * Parse a VND amount the backend serialized as a bigint string. Wallet amounts are
 * whole dong, so an integer parse is exact — never run float maths on the raw string.
 */
export function toVnd(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = typeof value === "number" ? value : Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Spendable balance as a number, safe to compare against an order total. */
export function walletBalance(wallet: Wallet | undefined | null): number {
  return toVnd(wallet?.balanceVnd);
}
