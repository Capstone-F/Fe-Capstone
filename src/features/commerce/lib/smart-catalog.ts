export function hasSmartCatalogConflict(selectedProductIds: string[]): boolean {
  return (
    selectedProductIds.includes("bha") && selectedProductIds.includes("retinol")
  );
}
