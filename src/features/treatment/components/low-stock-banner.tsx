"use client";

import { AlertTriangle, ShoppingCart } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { STOCK_WARNING_BANNER_CLASS } from "../constants/routine-tracking";
import type { StepStockWarning } from "../types/routine-tracking.types";

interface LowStockBannerProps {
  lowCount: number;
  emptyCount: number;
  topWarning: StepStockWarning | null;
  onOpen: () => void;
}

/** "1 sản phẩm đã hết, 2 sản phẩm sắp hết" — omits whichever half is zero. */
function buildMessage(lowCount: number, emptyCount: number): string {
  const parts: string[] = [];
  if (emptyCount > 0) {
    parts.push(`${emptyCount} sản phẩm đã hết`);
  }
  if (lowCount > 0) {
    parts.push(`${lowCount} sản phẩm sắp hết`);
  }
  return parts.join(", ");
}

/**
 * Day-level reorder entry point. Always available while any product needs
 * repurchasing, independent of the once-per-day automatic dialog.
 */
export function LowStockBanner({
  lowCount,
  emptyCount,
  topWarning,
  onOpen,
}: LowStockBannerProps) {
  if (topWarning === null) {
    return null;
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${STOCK_WARNING_BANNER_CLASS[topWarning]}`}
    >
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
        <div className="text-xs font-bold">
          {buildMessage(lowCount, emptyCount)}
          <p className="mt-0.5 text-[11px] font-medium opacity-80">
            Mua lại để không gián đoạn lộ trình chăm sóc da.
          </p>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onOpen}
        className="shrink-0 rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
      >
        <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
        Xem &amp; mua lại
      </Button>
    </div>
  );
}
