import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { productsApi } from "../api/products.api";
import type {
  ProductQuery,
  ProductDetail,
  ProductCategory,
  Product,
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
export type { ProductQuery };
