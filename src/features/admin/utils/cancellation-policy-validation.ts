export function isNoShowWeightValid(
  cancelLimit: number,
  noShowWeight: number,
): boolean {
  return noShowWeight <= cancelLimit;
}
