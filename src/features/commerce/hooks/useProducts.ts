"use client";

import { useMemo } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { productsApi } from "../api/products.api";
import {
  toBrandSummaries,
  toCategoryProductCounts,
} from "../mapper/catalog-facets";
import { FEATURED_PRODUCT_IDS } from "../constants/discovery";
import type {
  ProductQuery,
  ProductDetail,
  ProductCategory,
  Product,
  BrandSummary,
} from "../types/product.types";

export function useProducts(query?: ProductQuery) {
  return useQuery({
    queryKey: queryKeys.products(query),
    queryFn: async () => {
      const response = await productsApi.getProducts(query);
      return {
        products: response.data.items.map((item) => item.product),
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit,
      };
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async (): Promise<ProductDetail> => {
      const response = await productsApi.getProductById(id);
      return {
        product: response.data.product,
        ingredients: response.data.ingredients,
      };
    },
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.productCategories,
    queryFn: async (): Promise<ProductCategory[]> => {
      const response = await productsApi.getCategories();
      return response.data.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
      }));
    },
  });
}

export function useProductSuggestions(
  limit: number = 10,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: queryKeys.suggestions(limit),
    queryFn: async (): Promise<Product[]> => {
      try {
        const response = await productsApi.getSuggestions(limit);
        return response.data.items.map((item) => item.product);
      } catch (e) {
        console.error(
          "Failed to get product suggestions, falling back to empty list",
          e,
        );
        return [];
      }
    },
    enabled,
  });
}

/** BE has no /brands endpoint and categories carry no product count, so both are
 *  derived from a single scan of the first 100 products. Two hooks, one cache entry.
 *  LIMIT: brands (and counts) beyond the first 100 products are invisible. The seed
 *  is ~23 products / 5 brands so this holds today; once the catalog passes
 *  CATALOG_SCAN_LIMIT the bento starts missing brands and BE must expose
 *  GET /products/brands (recorded in 13-decisions-log.md). */
const CATALOG_SCAN_LIMIT = 100;

const catalogScanOptions = {
  queryKey: queryKeys.catalogScan,
  queryFn: async (): Promise<Product[]> => {
    const response = await productsApi.getProducts({
      limit: CATALOG_SCAN_LIMIT,
    });
    return response.data.items.map((item) => item.product);
  },
  staleTime: 5 * 60 * 1000,
};

export function useBrands(
  enabled: boolean = true,
): UseQueryResult<BrandSummary[]> {
  return useQuery({ ...catalogScanOptions, select: toBrandSummaries, enabled });
}

export function useCategoryProductCounts(): UseQueryResult<
  Record<string, number>
> {
  return useQuery({ ...catalogScanOptions, select: toCategoryProductCounts });
}

const FEATURED_SCAN_LIMIT = 24;

/** Reuses the useProducts cache instead of duplicating queryKey/queryFn — a
 *  duplicate key drifts and silently splits the cache. Sorting in a memo reads
 *  more plainly here than a TanStack `select`. */
export function useFeaturedProducts(limit = 8) {
  const query = useProducts({ limit: FEATURED_SCAN_LIMIT });

  const products = useMemo(() => {
    const rank = new Map(FEATURED_PRODUCT_IDS.map((id, index) => [id, index]));
    // When FEATURED_PRODUCT_IDS is empty, every rank lookup misses and falls
    // back to Infinity, so `Infinity - Infinity` is NaN for every comparison.
    // Array.prototype.sort treats a NaN comparator result as 0 (no swap), so
    // the list is left in the API's original order — a stable no-op, not a bug.
    return [...(query.data?.products ?? [])]
      .sort(
        (a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity),
      )
      .slice(0, limit);
  }, [query.data, limit]);

  return { products, isLoading: query.isLoading };
}

export type { ProductQuery };
