import type { TransactionStatus, TransactionType } from "../types/ledger.types";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

/**
 * The single place transaction types are enumerated for display. All nine
 * values must appear — a missing entry renders a raw enum string to the
 * operator. See spec R4.
 */
export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  PRODUCT_PURCHASE: "Mua sản phẩm",
  CONSULTATION_PAYMENT: "Thanh toán tư vấn",
  TREATMENT_PLAN_PAYMENT: "Thanh toán phác đồ",
  WALLET_TOPUP: "Nạp ví",
  REFUND: "Hoàn tiền",
  WITHDRAWAL: "Rút tiền về ngân hàng",
  WITHDRAWAL_REVERSAL: "Hoàn ví (từ chối rút)",
  ESCROW_RELEASE: "Giải ngân escrow",
  COMMISSION: "Hoa hồng sàn",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Đang chờ",
  COMPLETED: "Hoàn tất",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn",
};

/**
 * Only money genuinely leaving the platform reads destructive.
 * ESCROW_RELEASE moves platform-held escrow into the clinic's in-platform
 * wallet ("giải ngân về ví") — it makes funds withdrawable rather than
 * withdrawing them, so it is NOT an outflow. WITHDRAWAL_REVERSAL returns
 * money to the wallet after a rejected request, the opposite of an outflow.
 * The actual exit is WITHDRAWAL ("rút tiền về ngân hàng").
 */
const OUTFLOW_TYPES = new Set<string>(["REFUND", "WITHDRAWAL"]);
const RETAINED_TYPES = new Set<string>(["COMMISSION"]);

export function transactionTypeLabel(type: string): string {
  return TRANSACTION_TYPE_LABELS[type as TransactionType] ?? type;
}

export function transactionTypeBadgeVariant(type: string): BadgeVariant {
  if (OUTFLOW_TYPES.has(type)) return "destructive";
  if (RETAINED_TYPES.has(type)) return "secondary";
  if (type in TRANSACTION_TYPE_LABELS) return "default";
  return "outline";
}
