export enum StockImportFormStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
}

export interface StockImportFormResponseDto {
  id: string;
  productVariantId: string;
  quantity: number;
  manufacturingDate: string;
  batchCode: string | null;
  status: StockImportFormStatus;
  createdByUserId: string;
  submittedByUserId: string | null;
  submittedAt: string | null;
  confirmedByUserId: string | null;
  confirmedAt: string | null;
  cancelledByUserId: string | null;
  cancelledAt: string | null;
  rejectedByUserId: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  stockBatchId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedStockImportFormsDto {
  items: StockImportFormResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface ListStockImportFormsQueryDto {
  status?: StockImportFormStatus;
  productVariantId?: string;
  createdByUserId?: string;
  page?: number;
  limit?: number;
}

export interface CreateStockImportFormDto {
  productVariantId: string;
  quantity: number;
  manufacturingDate: string;
  batchCode?: string;
}

export interface UpdateStockImportFormDto {
  productVariantId?: string;
  quantity?: number;
  manufacturingDate?: string;
  batchCode?: string;
}

export interface RejectStockImportFormDto {
  reason?: string;
}

export interface ImportBatchDto {
  productVariantId: string;
  quantity: number;
  manufacturingDate: string;
  batchCode?: string;
}

export interface AdjustStockDto {
  quantity: number;
  note?: string;
}

export interface InventoryItemDto {
  productVariantId: string;
  productId: string;
  productName: string;
  sku: string;
  priceVnd: number;
  imageUrl: string | null;
  stockQuantity: number;
  activeIngredients: string[];
  stockWarning: "LOW" | "OUT_OF_STOCK" | null;
  warningMessage: string | null;
}

export interface LowStockThresholdDto {
  threshold: number;
}
