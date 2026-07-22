import type { Product, ProductVariant } from "./product.types";

export interface CartItem {
  productVariantId: string;
  quantity: number;
}

export interface CartLine {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  lines: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  unresolvedVariantIds: string[];
}

export interface CartResponse {
  source: "SURVEY" | "CATALOG" | null;
  surveyRecommendationId: string | null;
  items: CartItem[];
}
