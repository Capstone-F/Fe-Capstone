import { apiJson } from "@/lib/api/client";
import { Product, ProductCategory, ProductDetail } from "@/types/domain";

// Paths are unprefixed to match Be-Capstone in dev (setGlobalPrefix('api')
// only applies when NODE_ENV=production — see Global Constraints).
export const PRODUCT_API_PATHS = {
  GET_PRODUCTS: "/products",
  GET_PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  GET_CATEGORIES: "/products/categories",
};

export type ProductSort = "featured" | "price_asc" | "price_desc";

export interface ProductQuery {
  categoryId?: string;
  brandName?: string;
  ingredientName?: string;
  query?: string;
  page?: number;
  limit?: number;
}

interface ProductVariantResponse {
  id: string;
  sku: string;
  volume: string | null;
  packaging: string | null;
  priceVnd: number;
  isActive: boolean;
}

interface ProductResponse {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  isActive: boolean;
  variants: ProductVariantResponse[];
  createdAt: string;
  updatedAt: string;
}

interface ProductIngredientResponse {
  name: string;
  concentrationPct: number | null;
  isKeyIngredient: boolean;
}

interface ProductDetailResponse {
  product: ProductResponse;
  ingredients: ProductIngredientResponse[];
}

interface PaginatedProductsResponse {
  items: ProductDetailResponse[];
  total: number;
  page: number;
  limit: number;
}

interface ProductCategoryResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsPage {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

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
    `${PRODUCT_API_PATHS.GET_PRODUCTS}?${params.toString()}`,
  );

  return {
    products: response.items.map(toProduct),
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
}

export async function getProductById(id: string): Promise<ProductDetail> {
  const response = await apiJson<ProductDetailResponse>(
    PRODUCT_API_PATHS.GET_PRODUCT_DETAIL(id),
  );
  return { product: response.product, ingredients: response.ingredients };
}

export async function getCategories(): Promise<ProductCategory[]> {
  const response = await apiJson<ProductCategoryResponse[]>(
    PRODUCT_API_PATHS.GET_CATEGORIES,
  );
  return response.map((c) => ({ id: c.id, code: c.code, name: c.name }));
}
