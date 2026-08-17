export type AdminActivityType =
  | "USER_CREATED"
  | "PRODUCT_PAYMENT"
  | "CONSULTATION_PAYMENT"
  | "TREATMENT_PLAN_PAYMENT"
  | "REFUND"
  | "ORDER_CANCELLATION"
  | "STOCK_IMPORT"
  | "WITHDRAWAL_REQUESTED"
  | "WITHDRAWAL_PAID"
  | "WITHDRAWAL_REJECTED";

/** NOTE: amountVnd is a number here, unlike the ledger's string amounts. */
export interface AdminActivityItem {
  id: string;
  type: AdminActivityType;
  title: string;
  description: string | null;
  amountVnd: number | null;
  actorId: string | null;
  actorName: string | null;
  entityId: string | null;
  occurredAt: string;
}

export interface ListAdminActivityQuery {
  type?: AdminActivityType[];
  from?: string;
  to?: string;
  actorId?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAdminActivity {
  items: AdminActivityItem[];
  total: number;
  page: number;
  limit: number;
}
