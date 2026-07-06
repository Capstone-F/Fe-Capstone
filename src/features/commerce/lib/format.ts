/** Format a VND amount consistently with existing screens (e.g. "320.000đ"). */
export function formatVnd(value: number): string {
  return `${value.toLocaleString("vi-VN")}đ`;
}
