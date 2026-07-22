import { useState } from "react";
import { hasSmartCatalogConflict } from "@/features/commerce/lib/smart-catalog";

export function useProductSelection() {
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const [hasConflict, setHasConflict] = useState(false);

  const handleProductSelect = (id: string) => {
    const nextList = [...selectedProduct];
    if (!nextList.includes(id)) {
      nextList.push(id);
    }
    setSelectedProduct(nextList);

    // Conflict rules: BHA and Retinol should not be selected together
    setHasConflict(hasSmartCatalogConflict(nextList));
  };

  return {
    selectedProduct,
    hasConflict,
    handleProductSelect,
  };
}
