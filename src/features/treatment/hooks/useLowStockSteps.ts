import { useMemo } from "react";
import { collectLowStockItems, type LowStockItem } from "../lib/restock-prompt";
import type {
  StepStockWarning,
  TodaySession,
} from "../types/routine-tracking.types";

export interface LowStockSummary {
  items: LowStockItem[];
  lowCount: number;
  emptyCount: number;
  hasItems: boolean;
  /** Drives the banner tone: EMPTY wins whenever anything is empty. */
  topWarning: StepStockWarning | null;
}

/**
 * Derives the reorder list from the cached Today session. Pure selector — it issues no
 * request of its own, so mounting it is free.
 */
export function useLowStockSteps(
  session: TodaySession | undefined,
): LowStockSummary {
  return useMemo(() => {
    const items = collectLowStockItems(session?.routines ?? []);
    const emptyCount = items.filter((item) => item.warning === "EMPTY").length;
    const lowCount = items.length - emptyCount;

    let topWarning: StepStockWarning | null = null;
    if (emptyCount > 0) {
      topWarning = "EMPTY";
    } else if (lowCount > 0) {
      topWarning = "LOW";
    }

    return {
      items,
      lowCount,
      emptyCount,
      hasItems: items.length > 0,
      topWarning,
    };
  }, [session]);
}
