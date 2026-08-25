import type { Product, ProductVariant } from "./product.types";
import type { OrderSource } from "@/types/domain";

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

export type ConflictSeverity = "LOW" | "MEDIUM" | "HIGH";

/**
 * A soft ingredient-protocol conflict between two products currently in the
 * cart. Informational only — it never blocks add-to-cart or checkout.
 */
export interface CartConflict {
  protocolCode: string;
  conflictingProtocolCode: string;
  severity: ConflictSeverity;
  /** Vietnamese warning text — the primary UI copy. */
  description: string;
  /** English internal reason; may be absent. */
  reason: string | null;
  /** Cart variant ids whose product maps to protocolCode. */
  productVariantIds: string[];
  /** Cart variant ids whose product maps to conflictingProtocolCode. */
  conflictingProductVariantIds: string[];
}

export interface CartResponse {
  source: OrderSource | null;
  surveyRecommendationId: string | null;
  treatmentPhaseId: string | null;
  items: CartItem[];
  conflicts: CartConflict[];
}
