/** Balance returned by GET /wallet/me (BE WalletBalanceDto). */
export interface Wallet {
  id: string;
  userId: string;
  /** VND. The backend serializes bigint columns as strings — never do maths on it directly. */
  balanceVnd: string;
  isActive: boolean;
}

/**
 * Ledger row types a customer wallet can produce. The backend enum has four more
 * (WITHDRAWAL, WITHDRAWAL_REVERSAL, ESCROW_RELEASE, COMMISSION); those carry clinic or
 * platform accounts, so GET /wallet/me/transactions filters them out even when the row
 * is tagged with this customer's userId.
 */
export type WalletTransactionType =
  | "WALLET_TOPUP"
  | "PRODUCT_PURCHASE"
  | "CONSULTATION_PAYMENT"
  | "TREATMENT_PLAN_PAYMENT"
  | "REFUND";

export type WalletTransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

/** Money direction, resolved by the backend. CREDIT = into the wallet. */
export type WalletTransactionDirection = "CREDIT" | "DEBIT";

/** One row of the wallet ledger (BE WalletTransactionResponseDto). */
export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  direction: WalletTransactionDirection;
  /** Absolute amount in VND, string for the same reason as Wallet.balanceVnd. */
  amountVnd: string;
  orderId: string | null;
  consultationId: string | null;
  treatmentId: string | null;
  treatmentPhaseId: string | null;
  clinicId: string | null;
  expertId: string | null;
  note: string | null;
  createdAt: string;
}

export interface WalletTransactionsParams {
  /** 1-based; backend caps limit at 100 and defaults to 20. */
  page?: number;
  limit?: number;
  type?: WalletTransactionType;
  direction?: WalletTransactionDirection;
  /** ISO datetime bounds on createdAt. */
  from?: string;
  to?: string;
}

export interface UseWalletOptions {
  enabled?: boolean;
}

export interface WalletTopUpRequest {
  /** Minimum accepted by the backend is 10.000 VND. */
  amountVnd: number;
  client?: "web" | "mobile";
  /** Absolute URL the gateway redirects back to; defaults to the backend's configured web return URL. */
  returnUrl?: string;
}

export interface WalletTopUpResponse {
  paymentId: string;
  paymentUrl: string;
}
