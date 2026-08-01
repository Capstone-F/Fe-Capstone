"use client";

import { AlertTriangle, PackageX } from "lucide-react";
import {
  formatRemainingMl,
  STOCK_WARNING_BADGE_CLASS,
  STOCK_WARNING_LABELS,
} from "../constants/routine-tracking";
import type { StepStockWarning } from "../types/routine-tracking.types";

interface StepStockBadgeProps {
  warning: StepStockWarning | null;
  remainingMl: number | null;
}

/**
 * Stock chip for one routine step. Renders nothing when the backend reports no
 * warning, so steps with healthy stock look exactly as they did before.
 */
export function StepStockBadge({ warning, remainingMl }: StepStockBadgeProps) {
  if (warning === null) {
    return null;
  }

  const Icon = warning === "EMPTY" ? PackageX : AlertTriangle;
  const remaining = formatRemainingMl(remainingMl);

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${STOCK_WARNING_BADGE_CLASS[warning]}`}
    >
      <Icon className="h-3 w-3" />
      {STOCK_WARNING_LABELS[warning]}
      {remaining !== null && <span className="font-normal">· {remaining}</span>}
    </span>
  );
}
