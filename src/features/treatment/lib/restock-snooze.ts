// "Đã mua bổ sung" snooze rules. Pure: callers own storage and pass state in.
//
// Why this exists at all: the backend already counts a product as restocked the moment
// its order reaches PAID/PROCESSING/SHIPPED/DELIVERED, so an in-app card payment clears
// the warning on its own. The two cases it cannot see are an order still sitting at
// PENDING, and a purchase made outside the app entirely — that is what the manual
// button covers.

/** How long a self-reported re-purchase silences the warning before it returns. */
export const RESTOCK_SNOOZE_DAYS = 14;

export const RESTOCK_SNOOZE_STORAGE_KEY = "glowscan_restock_snoozes";

export interface RestockSnooze {
  variantId: string;
  /** Server VN calendar date (YYYY-MM-DD) the user tapped "Đã mua bổ sung". */
  snoozedAt: string;
}

/** Whole days between two YYYY-MM-DD server dates. Never uses the device clock. */
export function daysBetweenDates(from: string, to: string): number {
  const fromMs = Date.parse(`${from}T00:00:00Z`);
  const toMs = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(fromMs) || Number.isNaN(toMs)) {
    return 0;
  }
  return Math.floor((toMs - fromMs) / 86_400_000);
}

/**
 * Drop snoozes that have done their job or outstayed their welcome.
 *
 * A snooze disappears when the backend stops warning about that variant — that is the
 * "hàng đã về" signal, and from then on there is nothing to show at all. It also
 * expires after RESTOCK_SNOOZE_DAYS so a mistaken tap cannot silence a product forever.
 */
export function pruneSnoozes(
  snoozes: readonly RestockSnooze[],
  warnedVariantIds: ReadonlySet<string>,
  serverDate: string,
): RestockSnooze[] {
  return snoozes.filter(
    (snooze) =>
      warnedVariantIds.has(snooze.variantId) &&
      daysBetweenDates(snooze.snoozedAt, serverDate) < RESTOCK_SNOOZE_DAYS,
  );
}

/** Tolerant parse — a corrupted entry must not break the Care Hub. */
export function parseSnoozes(raw: string | null): RestockSnooze[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(
      (entry): entry is RestockSnooze =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as RestockSnooze).variantId === "string" &&
        typeof (entry as RestockSnooze).snoozedAt === "string",
    );
  } catch {
    return [];
  }
}
