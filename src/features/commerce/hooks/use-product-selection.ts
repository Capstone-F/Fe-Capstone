import { useState } from "react";

export function useProductSelection() {
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);
  const [hasConflict, setHasConflict] = useState(false);

  const handleProductSelect = (id: string) => {
    let nextList = [...selectedProduct];
    if (nextList.includes(id)) {
      nextList = nextList.filter((item) => item !== id);
    } else {
      nextList.push(id);
    }
    setSelectedProduct(nextList);

    // Conflict rules: BHA and Retinol should not be selected together
    const hasBha = nextList.includes("bha");
    const hasRetinol = nextList.includes("retinol");
    setHasConflict(hasBha && hasRetinol);
  };

  return {
    selectedProduct,
    hasConflict,
    handleProductSelect,
  };
}
