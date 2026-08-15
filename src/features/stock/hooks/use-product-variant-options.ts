"use client";

import { useMemo } from "react";
import { useProducts } from "@/features/commerce/hooks/useProducts";

export interface ProductVariantOption {
  variantId: string;
  label: string;
  productName: string;
  sku: string;
  volume: string | null;
}

export function useProductVariantOptions() {
  const productsQuery = useProducts({ limit: 100 });

  const options = useMemo<ProductVariantOption[]>(() => {
    const result: ProductVariantOption[] = [];

    for (const product of productsQuery.data?.products ?? []) {
      for (const variant of product.variants ?? []) {
        const volume = variant.volume ? ` · ${variant.volume}` : "";
        result.push({
          variantId: variant.id,
          label: `${product.name} · SKU ${variant.sku}${volume}`,
          productName: product.name,
          sku: variant.sku,
          volume: variant.volume,
        });
      }
    }

    return result;
  }, [productsQuery.data?.products]);

  const optionsById = useMemo(
    () => new Map(options.map((option) => [option.variantId, option])),
    [options],
  );

  return {
    options,
    optionsById,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
  };
}
