import { Product, ProductCategory } from "@/types/domain";
import {
  MOCK_PRODUCTS,
  PRODUCT_BRANDS,
  PRODUCT_CATEGORIES,
  SKIN_CONCERNS,
  SKIN_TYPES,
} from "../data/mock-catalog";

// Forward-looking endpoint map (mirrors experts-client convention).
export const PRODUCT_API_PATHS = {
  GET_PRODUCTS: "/products",
  GET_PRODUCT_DETAIL: (id: string) => `/products/${id}`,
  GET_RECOMMENDED: "/products/recommended",
  GET_FILTER_META: "/products/meta/filters",
};

export type ProductSort = "featured" | "price_asc" | "price_desc";

export interface ProductFilters {
  search?: string;
  category?: ProductCategory | "Tất cả";
  brand?: string;
  skinType?: string;
  concern?: string;
  maxPrice?: number;
  sort?: ProductSort;
}

export interface FilterMeta {
  categories: ProductCategory[];
  brands: string[];
  skinTypes: string[];
  concerns: string[];
}

export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let result = [...MOCK_PRODUCTS];

  if (filters) {
    const { search, category, brand, skinType, concern, maxPrice, sort } =
      filters;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.ingredients.some((i) => i.toLowerCase().includes(q)),
      );
    }
    if (category && category !== "Tất cả") {
      result = result.filter((p) => p.category === category);
    }
    if (brand && brand !== "Tất cả") {
      result = result.filter((p) => p.brand === brand);
    }
    if (skinType && skinType !== "Tất cả") {
      result = result.filter((p) => p.skinTypes.includes(skinType));
    }
    if (concern && concern !== "Tất cả") {
      result = result.filter((p) => p.concerns.includes(concern));
    }
    if (maxPrice) {
      result = result.filter((p) => p.priceVnd <= maxPrice);
    }
    if (sort === "price_asc") {
      result.sort((a, b) => a.priceVnd - b.priceVnd);
    } else if (sort === "price_desc") {
      result.sort((a, b) => b.priceVnd - a.priceVnd);
    }
  }

  return result;
}

export async function getProductById(id: string): Promise<Product> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) {
    throw new Error(`Sản phẩm với ID ${id} không tồn tại`);
  }
  return product;
}

export async function getRecommended(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return MOCK_PRODUCTS.filter((p) => p.matchesUserSkin).slice(0, 4);
}

export async function getFilterMeta(): Promise<FilterMeta> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    categories: PRODUCT_CATEGORIES,
    brands: PRODUCT_BRANDS,
    skinTypes: SKIN_TYPES,
    concerns: SKIN_CONCERNS,
  };
}
