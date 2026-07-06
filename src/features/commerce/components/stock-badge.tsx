import { StockStatus } from "@/types/domain";
import { vi } from "@/config/locales/vi";
import { cn } from "@/lib/utils";

const STYLES: Record<StockStatus, string> = {
  in_stock: "bg-success-soft text-success",
  low_stock: "bg-warning-soft text-warning",
  out_of_stock: "bg-destructive-soft text-destructive",
};

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
        STYLES[status],
      )}
    >
      {vi.commerce.stock[status]}
    </span>
  );
}
