export interface ProductVariant {
  id: string;
  sku: string;
  volume: string | null;
  packaging: string | null;
  priceVnd: number;
  isActive: boolean;
  imageUrl: string | null;
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

export interface BrandSummary {
  id: string;
  name: string;
  /** Count within the scan batch, NOT the catalog total. See useBrands. */
  productCount: number;
}

export interface ProductQuery {
  categoryId?: string;
  /** Exact FK match — preferred over `brandName`, which BE matches with ILIKE %...%. */
  brandId?: string;
  brandName?: string;
  ingredientName?: string;
  query?: string;
  page?: number;
  limit?: number;
}

/** Page state parsed out of the URL. The URL is the single source of truth. */
export interface ProductFilters {
  categoryId?: string;
  brandId?: string;
  brandName?: string;
  ingredientName?: string;
  query?: string;
  /** Only meaningful when no other filter is set: "show the full catalog". */
  view?: "all";
  /** `recommended` | `newest` — links coming from shop home. */
  section?: string;
  page: number;
  limit: number;
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
  imageUrl: string | null;
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
