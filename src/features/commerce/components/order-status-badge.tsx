import { OrderStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

// Exhaustive over OrderStatus, so adding a status to the union becomes a type
// error here rather than an unstyled badge at runtime.
const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-warning-soft text-warning",
  PAID: "bg-primary-soft text-primary",
  PROCESSING: "bg-primary-soft text-primary",
  SHIPPED: "bg-sky text-slate-700",
  DELIVERED: "bg-success-soft text-success",
  CANCELLED: "bg-destructive-soft text-destructive",
  REFUNDED: "bg-destructive-soft text-destructive",
};

const STATUS_TEXT: Record<OrderStatus, string> = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã huỷ",
  REFUNDED: "Đã hoàn tiền",
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-bold",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_TEXT[status]}
    </span>
  );
}
