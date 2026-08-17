/**
 * Mirrors GET /admin/transactions. Amounts are strings (Postgres bigint) —
 * always read them through parseVnd.
 */
export type TransactionType =
  | "PRODUCT_PURCHASE"
  | "CONSULTATION_PAYMENT"
  | "TREATMENT_PLAN_PAYMENT"
  | "WALLET_TOPUP"
  | "REFUND"
  | "WITHDRAWAL"
  | "WITHDRAWAL_REVERSAL"
  | "ESCROW_RELEASE"
  | "COMMISSION";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface AdminTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amountVnd: string;
  fromAccount: string | null;
  toAccount: string | null;
  clinicId: string | null;
  clinicName: string | null;
  userId: string | null;
  userName: string | null;
  orderId: string | null;
  consultationId: string | null;
  treatmentId: string | null;
  treatmentPhaseId: string | null;
  escrowHoldId: string | null;
  withdrawalId: string | null;
  expertId: string | null;
  externalRef: string | null;
  note: string | null;
  createdAt: string;
}

export interface ListAdminTransactionsQuery {
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  clinicId?: string;
  userId?: string;
  expertId?: string;
  orderId?: string;
  from?: string;
  to?: string;
  minAmountVnd?: number;
  maxAmountVnd?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedAdminTransactions {
  items: AdminTransaction[];
  total: number;
  page: number;
  limit: number;
}
