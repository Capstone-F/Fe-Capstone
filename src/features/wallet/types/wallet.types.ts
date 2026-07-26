export interface Wallet {
  id: string;
  userId: string;
  balanceVnd: number;
  isActive: boolean;
  updatedAt: string;
}

export type WalletTransactionType =
  | "CONSULTATION_PAYMENT"
  | "REFUND"
  | "TOP_UP"
  | "PRODUCT_PURCHASE";

export interface WalletTransaction {
  id: string;
  walletId: string;
  amountVnd: number;
  type: WalletTransactionType;
  status: "COMPLETED" | "PENDING" | "FAILED";
  consultationId?: string;
  createdAt: string;
}
