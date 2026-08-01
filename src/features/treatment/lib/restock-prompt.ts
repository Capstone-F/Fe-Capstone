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
  remainingMl: number | null;
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
 * list it twice and add double the quantity to the cart. When a variant appears more
 * than once we keep the most severe warning and the lowest remaining volume.
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
          remainingMl: step.remainingMl,
        });
        continue;
      }

      if (isMoreSevere(step.warning, existing.warning)) {
        existing.warning = step.warning;
      }
      if (
        step.remainingMl !== null &&
        (existing.remainingMl === null ||
          step.remainingMl < existing.remainingMl)
      ) {
        existing.remainingMl = step.remainingMl;
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
