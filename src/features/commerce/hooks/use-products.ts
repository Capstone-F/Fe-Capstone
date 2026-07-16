import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import {
  getCategories,
  getProductById,
  getProducts,
  ProductQuery,
} from "../api/products-client";

export function useProducts(query?: ProductQuery) {
  return useQuery({
    queryKey: queryKeys.products(query),
    queryFn: () => getProducts(query),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.productCategories,
    queryFn: getCategories,
  });
}
