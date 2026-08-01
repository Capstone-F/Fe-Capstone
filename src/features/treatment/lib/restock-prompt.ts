// Pure decision logic for the low-stock reorder prompt. No React, no HTTP, no
// localStorage access — callers pass state in and act on the result. The stock
// thresholds themselves belong to the backend (routine-tracking-flow.md §4.6);
// nothing here estimates anything.

import type {
  StepStockWarning,
  TodayStep,
} from "../types/routine-tracking.types";

/** One product that needs repurchasing, already deduped across steps and periods. */
export interface LowStockItem {
  variantId: string;
  productId: string | null;
  name: string;
  imageUrl: string | null;
  warning: StepStockWarning;
  /** Whole days of use left; drives the badge copy. */
  daysLeft: number | null;
}

interface RoutineWithSteps {
  steps: readonly TodayStep[];
}

/** EMPTY is strictly more urgent than LOW. */
function isMoreSevere(
  candidate: StepStockWarning,
  current: StepStockWarning,
): boolean {
  return candidate === "EMPTY" && current === "LOW";
}

/**
 * Flatten every warned step into a per-variant list.
 *
 * Deduping by variant id is essential: one bottle commonly backs several steps (a
 * cleanser used morning and evening is two steps), and without this the dialog would
 * list it twice and add double the quantity to the cart. The backend estimates per
 * bottle, so duplicates normally agree — we still keep the most severe warning and
 * the fewest days left so a mismatch can never under-report urgency.
 */
export function collectLowStockItems(
  routines: readonly RoutineWithSteps[],
): LowStockItem[] {
  const byVariant = new Map<string, LowStockItem>();

  for (const routine of routines) {
    for (const step of routine.steps) {
      const variant = step.productVariant;
      if (step.warning === null || variant === null) {
        continue;
      }

      const existing = byVariant.get(variant.id);
      if (existing === undefined) {
        byVariant.set(variant.id, {
          variantId: variant.id,
          productId: variant.productId,
          name: variant.name,
          imageUrl: variant.imageUrl,
          warning: step.warning,
          daysLeft: step.daysLeft,
        });
        continue;
      }

      if (isMoreSevere(step.warning, existing.warning)) {
        existing.warning = step.warning;
      }
      if (
        step.daysLeft !== null &&
        (existing.daysLeft === null || step.daysLeft < existing.daysLeft)
      ) {
        existing.daysLeft = step.daysLeft;
      }
    }
  }

  // EMPTY first so the most urgent products lead the banner and the dialog.
  return [...byVariant.values()].sort((a, b) => {
    if (a.warning === b.warning) {
      return a.name.localeCompare(b.name, "vi");
    }
    return a.warning === "EMPTY" ? -1 : 1;
  });
}

export interface LowStockSummary {
  lowCount: number;
  emptyCount: number;
  hasItems: boolean;
  /** Drives the banner tone: EMPTY wins whenever anything is empty. */
  topWarning: StepStockWarning | null;
}

/**
 * Counts for a list of warned products. Kept separate from the collection step so the
 * banner can summarise the *remaining* products after the ones already being restocked
 * are filtered out.
 */
export function summarizeLowStock(
  items: readonly LowStockItem[],
): LowStockSummary {
  const emptyCount = items.filter((item) => item.warning === "EMPTY").length;
  const lowCount = items.length - emptyCount;

  let topWarning: StepStockWarning | null = null;
  if (emptyCount > 0) {
    topWarning = "EMPTY";
  } else if (lowCount > 0) {
    topWarning = "LOW";
  }

  return { lowCount, emptyCount, hasItems: items.length > 0, topWarning };
}

/**
 * Dismissal is scoped to the backend's VN calendar date, never the device clock —
 * the same convention the support-habit ticks use in care-hub-page.tsx.
 */
export function restockDismissalKey(serverDate: string): string {
  return `glowscan_restock_dismissed_${serverDate}`;
}

export interface RestockPromptInput {
  /** At least one product needs repurchasing. */
  hasItems: boolean;
  /** The daily check-in dialog just closed, so nothing else owns the screen. */
  checkInJustClosed: boolean;
  /** Server date stored under the dismissal key, or null when never dismissed. */
  dismissedDate: string | null;
  /** Server VN calendar date from the Today payload; undefined until it loads. */
  serverDate: string | undefined;
}

/**
 * Auto-open the reorder dialog at most once per server day, and only after the
 * check-in dialog has closed so two dialogs never stack. The banner remains an
 * always-available manual entry point regardless of what this returns.
 */
export function shouldPromptRestock(input: RestockPromptInput): boolean {
  if (input.serverDate === undefined) {
    return false;
  }
  return (
    input.hasItems &&
    input.checkInJustClosed &&
    input.dismissedDate !== input.serverDate
  );
}
