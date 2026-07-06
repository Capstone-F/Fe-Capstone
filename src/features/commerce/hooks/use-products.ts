import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  getFilterMeta,
  getProductById,
  getProducts,
  getRecommended,
  ProductFilters,
} from "../api/products-client";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: queryKeys.products(filters),
    queryFn: () => getProducts(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

export function useRecommended() {
  return useQuery({
    queryKey: queryKeys.recommendedProducts,
    queryFn: getRecommended,
  });
}

export function useFilterMeta() {
  return useQuery({
    queryKey: queryKeys.productFilterMeta,
    queryFn: getFilterMeta,
  });
}
