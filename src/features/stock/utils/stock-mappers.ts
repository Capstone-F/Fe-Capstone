import { StockImportFormStatus } from "../types/stock.types";

export const STOCK_STATUS_LABELS: Record<StockImportFormStatus, string> = {
  [StockImportFormStatus.DRAFT]: "Bản nháp",
  [StockImportFormStatus.SUBMITTED]: "Chờ duyệt",
  [StockImportFormStatus.CONFIRMED]: "Đã nhập kho",
  [StockImportFormStatus.CANCELLED]: "Đã hủy",
  [StockImportFormStatus.REJECTED]: "Đã từ chối",
};

export const STOCK_STATUS_BADGE_VARIANTS: Record<
  StockImportFormStatus,
  "outline" | "secondary" | "default" | "destructive"
> = {
  [StockImportFormStatus.DRAFT]: "outline",
  [StockImportFormStatus.SUBMITTED]: "secondary",
  [StockImportFormStatus.CONFIRMED]: "default",
  [StockImportFormStatus.CANCELLED]: "outline",
  [StockImportFormStatus.REJECTED]: "destructive",
};

export function getStockStatusLabel(status: StockImportFormStatus): string {
  return STOCK_STATUS_LABELS[status] || status;
}
