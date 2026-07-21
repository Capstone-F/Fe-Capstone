export interface ProductVariant {
  id: string;
  sku: string;
  volume: string | null;
  packaging: string | null;
  priceVnd: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  isActive: boolean;
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductIngredient {
  name: string;
  concentrationPct: number | null;
  isKeyIngredient: boolean;
}

export interface ProductDetail {
  product: Product;
  ingredients: ProductIngredient[];
}

export interface ProductCategory {
  id: string;
  code: string;
  name: string;
}

export type ProductSort = "featured" | "price_asc" | "price_desc";

export interface ProductQuery {
  categoryId?: string;
  brandName?: string;
  ingredientName?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface ProductsPage {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductVariantResponse {
  id: string;
  sku: string;
  volume: string | null;
  packaging: string | null;
  priceVnd: number;
  isActive: boolean;
}

export interface ProductResponse {
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

export interface ProductIngredientResponse {
  name: string;
  concentrationPct: number | null;
  isKeyIngredient: boolean;
}

export interface ProductDetailResponse {
  product: ProductResponse;
  ingredients: ProductIngredientResponse[];
}

export interface PaginatedProductsResponse {
  items: ProductDetailResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductCategoryResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
