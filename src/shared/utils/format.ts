import formatCurrency from "./currency";

/** Format a VND amount consistently using currency utility. */
export function formatVnd(value: number): string {
  return formatCurrency(value);
}
export { formatCurrency };
