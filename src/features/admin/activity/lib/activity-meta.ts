import {
  Banknote,
  Boxes,
  CircleDot,
  PackagePlus,
  ShoppingBag,
  Stethoscope,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { AdminActivityType } from "../types/activity.types";

export interface ActivityMeta {
  icon: LucideIcon;
  /** Filtered list page — entityId is not routable for every type. */
  href: string | null;
}

export const ACTIVITY_TYPE_LABELS: Record<AdminActivityType, string> = {
  USER_CREATED: "Tài khoản mới",
  PRODUCT_PAYMENT: "Thanh toán đơn hàng",
  CONSULTATION_PAYMENT: "Thanh toán tư vấn",
  TREATMENT_PLAN_PAYMENT: "Thanh toán phác đồ",
  REFUND: "Hoàn tiền",
  ORDER_CANCELLATION: "Hủy đơn hàng",
  STOCK_IMPORT: "Phiếu nhập kho",
  WITHDRAWAL_REQUESTED: "Yêu cầu rút tiền",
  WITHDRAWAL_PAID: "Đã chi trả rút tiền",
  WITHDRAWAL_REJECTED: "Từ chối rút tiền",
};

const META: Record<AdminActivityType, ActivityMeta> = {
  USER_CREATED: { icon: UserPlus, href: "/dashboard/users" },
  PRODUCT_PAYMENT: { icon: ShoppingBag, href: "/dashboard/commerce" },
  CONSULTATION_PAYMENT: { icon: Stethoscope, href: "/dashboard/ledger" },
  TREATMENT_PLAN_PAYMENT: { icon: Stethoscope, href: "/dashboard/ledger" },
  REFUND: { icon: Boxes, href: "/dashboard/finance?tab=refunds" },
  ORDER_CANCELLATION: { icon: Boxes, href: "/dashboard/cancellations" },
  STOCK_IMPORT: { icon: PackagePlus, href: "/dashboard/stock-imports" },
  WITHDRAWAL_REQUESTED: {
    icon: Banknote,
    href: "/dashboard/clinic-withdrawals",
  },
  WITHDRAWAL_PAID: { icon: Banknote, href: "/dashboard/finance?tab=clinics" },
  WITHDRAWAL_REJECTED: {
    icon: Banknote,
    href: "/dashboard/clinic-withdrawals",
  },
};

const FALLBACK: ActivityMeta = { icon: CircleDot, href: null };

export function activityMetaFor(type: string): ActivityMeta {
  return META[type as AdminActivityType] ?? FALLBACK;
}

export function activityTypeLabel(type: string): string {
  return ACTIVITY_TYPE_LABELS[type as AdminActivityType] ?? type;
}
