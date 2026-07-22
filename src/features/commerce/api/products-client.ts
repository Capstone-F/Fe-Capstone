import { apiJson } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/config/api-endpoints";

import type {
  PaginatedProductsResponse,
  Product,
  ProductCategory,
  ProductCategoryResponse,
  ProductDetail,
  ProductDetailResponse,
  ProductQuery,
  ProductsPage,
} from "../types/product";

export type { ProductQuery, ProductsPage };

const CATALOG_PAGE_SIZE = 100;

function toProduct(response: ProductDetailResponse): Product {
  return response.product;
}

/**
 * `query` (free-text), `brandName` (ILIKE substring), and `ingredientName`
 * (matches products containing the ingredient) are real Be-Capstone query
 * params (ListProductsQueryDto) — sent server-side. `page`/`limit` drive
 * server-side pagination (max limit 100, enforced by BE).
 */
export async function getProducts(query?: ProductQuery): Promise<ProductsPage> {
  const params = new URLSearchParams();
  if (query?.categoryId) params.set("categoryId", query.categoryId);
  if (query?.brandName) params.set("brandName", query.brandName);
  if (query?.ingredientName) params.set("ingredientName", query.ingredientName);
  if (query?.query) params.set("query", query.query);
  params.set("page", String(query?.page ?? 1));
  params.set("limit", String(query?.limit ?? 20));

  const response = await apiJson<PaginatedProductsResponse>(
    `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`,
  );

  return {
    products: response.items.map(toProduct),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}

/**
 * Fetch the entire catalog, not just the first page.
 *
 * Order and cart lines carry only a productVariantId and Be-Capstone exposes no
 * variant-by-id endpoint, so every variant must be present in the pool for a
 * name to resolve. BE caps `limit` at 100, so page 1 alone silently loses any
 * variant beyond the first 100 products. Fetch page 1, then the rest in parallel.
 */
export async function getAllProducts(): Promise<Product[]> {
  const first = await getProducts({ page: 1, limit: CATALOG_PAGE_SIZE });
  const pageCount = Math.ceil(first.total / CATALOG_PAGE_SIZE);
  if (pageCount <= 1) return first.products;

  const rest = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, i) =>
      getProducts({ page: i + 2, limit: CATALOG_PAGE_SIZE }),
    ),
  );
  return [...first.products, ...rest.flatMap((p) => p.products)];
}

export async function getProductById(id: string): Promise<ProductDetail> {
  const response = await apiJson<ProductDetailResponse>(
    API_ENDPOINTS.PRODUCTS.DETAIL(id),
  );
  return { product: response.product, ingredients: response.ingredients };
}

export async function getCategories(): Promise<ProductCategory[]> {
  const response = await apiJson<ProductCategoryResponse[]>(
    API_ENDPOINTS.PRODUCTS.CATEGORIES,
  );
  return response.map((c) => ({ id: c.id, code: c.code, name: c.name }));
}

export async function getSuggestions(limit: number = 10): Promise<Product[]> {
  try {
    const response = await apiJson<PaginatedProductsResponse>(
      `${API_ENDPOINTS.PRODUCTS.SUGGESTION}?limit=${limit}`,
    );
    return response.items.map(toProduct);
  } catch (e) {
    console.error(
      "Failed to get product suggestions, falling back to empty list",
      e,
    );
    return [];
  }
}
