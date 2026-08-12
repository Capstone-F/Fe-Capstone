export type OrderCancellationStatus =
  | "REQUESTED"
  | "REFUNDING"
  | "REFUNDED"
  | "AWAITING_RETURN"
  | "RESTOCKED"
  | "COMPLETED"
  | "FAILED";

export interface OrderCancellationItem {
  id: string;
  orderItemId: string;
  productVariantId?: string;
  productName?: string;
  expectedQuantity: number;
  goodQuantity?: number | null;
  damagedQuantity?: number | null;
}

export interface OrderCancellation {
  id: string;
  orderId: string;
  status: OrderCancellationStatus;
  refundAmountVnd: number;
  requiresStockReturn: boolean;
  nextRunAt?: string | null;
  attempts?: number;
  lastError?: string | null;
  items: OrderCancellationItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ConfirmReturnItemInput {
  orderItemId: string;
  goodQuantity: number;
  damagedQuantity: number;
}

export interface ConfirmReturnDto {
  items: ConfirmReturnItemInput[];
  note?: string;
}

export interface CancelOrderStaffDto {
  orderId: string;
  reason?: string;
}

export interface AdvanceCancellationDto {
  steps?: number;
}

export interface ListCancellationsParams {
  status?: OrderCancellationStatus | "ALL";
  page?: number;
  limit?: number;
}

export interface PaginatedCancellationsResponse {
  items: OrderCancellation[];
  total: number;
  page: number;
  limit: number;
}
