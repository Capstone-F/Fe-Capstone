import { useMemo } from "react";
import { collectLowStockItems, type LowStockItem } from "../lib/restock-prompt";
import type { TodaySession } from "../types/routine-tracking.types";

/**
 * Every product the backend is warning about, deduped per variant. Pure selector over
 * the cached Today session — it issues no request of its own, so mounting it is free.
 *
 * Callers that need counts should summarise the list *after* filtering out products
 * already being restocked; see summarizeLowStock and useRestockStatus.
 */
export function useLowStockSteps(
  session: TodaySession | undefined,
): LowStockItem[] {
  return useMemo(
    () => collectLowStockItems(session?.routines ?? []),
    [session],
  );
}
