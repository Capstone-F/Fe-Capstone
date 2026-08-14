import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import type { AxiosResponse } from "axios";
import type {
  PaginatedProductsResponse,
  ProductCategoryResponse,
  ProductDetailResponse,
  ProductQuery,
} from "../types/product.types";

export const productsApi = {
  getProducts: (
    query?: ProductQuery,
  ): Promise<AxiosResponse<PaginatedProductsResponse>> => {
    return apiClient.get<PaginatedProductsResponse>(
      API_ENDPOINTS.PRODUCTS.LIST,
      {
        params: {
          categoryId: query?.categoryId,
          brandId: query?.brandId,
          brandName: query?.brandName,
          ingredientName: query?.ingredientName,
          query: query?.query,
          page: query?.page ?? 1,
          limit: query?.limit ?? 20,
        },
      },
    );
  },

  getProductById: (
    id: string,
  ): Promise<AxiosResponse<ProductDetailResponse>> => {
    return apiClient.get<ProductDetailResponse>(
      API_ENDPOINTS.PRODUCTS.DETAIL(id),
    );
  },

  getCategories: (): Promise<AxiosResponse<ProductCategoryResponse[]>> => {
    return apiClient.get<ProductCategoryResponse[]>(
      API_ENDPOINTS.PRODUCTS.CATEGORIES,
    );
  },

  getSuggestions: (
    limit = 10,
  ): Promise<AxiosResponse<PaginatedProductsResponse>> => {
    return apiClient.get<PaginatedProductsResponse>(
      API_ENDPOINTS.PRODUCTS.SUGGESTION,
      {
        params: { limit },
      },
    );
  },
};
