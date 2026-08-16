/**
 * WHAT: The single place VND amounts are coerced to a number.
 * WHY: `/admin/clinic-withdrawals` returns `amountVnd` as a string (Postgres bigint)
 *      while `/admin/order-cancellations` returns `refundAmountVnd` as a number.
 *      VND magnitudes are far below 2^53, so `number` is safe for both.
 */
export function parseVnd(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function sumVnd<T>(
  items: T[],
  pick: (item: T) => string | number | null | undefined,
): number {
  return items.reduce((total, item) => total + parseVnd(pick(item)), 0);
}
