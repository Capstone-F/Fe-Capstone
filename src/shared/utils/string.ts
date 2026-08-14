/**
 * Removes Vietnamese diacritics and accents for robust insensitive searching.
 * Example: "Hà Nội" -> "ha noi", "Đà Nẵng" -> "da nang"
 */
export function normalizeVietnamese(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}
