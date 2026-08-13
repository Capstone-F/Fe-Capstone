import formatCurrency from "./currency";

/** Format a VND amount consistently using currency utility. */
export function formatVnd(value: number): string {
  return formatCurrency(value);
}

/** Format a VND bigint string (e.g., "270000") for display without parsing to JS Number for math. */
export function formatVndString(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined || value === "") return "0 ₫";
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num)) return `${value} ₫`;
  return formatCurrency(num);
}

export { formatCurrency };
