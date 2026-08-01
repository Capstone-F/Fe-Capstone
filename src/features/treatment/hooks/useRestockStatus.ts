"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/features/commerce/api/orders.api";
import { queryKeys } from "@/lib/query/keys";
import type { LowStockItem } from "../lib/restock-prompt";
import {
  parseSnoozes,
  pruneSnoozes,
  RESTOCK_SNOOZE_STORAGE_KEY,
  type RestockSnooze,
} from "../lib/restock-snooze";

const PENDING_ORDER_PAGE_SIZE = 20;

/**
 * Variants sitting in an unpaid order. The backend only counts PAID and later as
 * stock, so a PENDING order is exactly the window where the user has ordered but the
 * warning would otherwise still nag them.
 */
function usePendingOrderVariantIds(enabled: boolean): Set<string> {
  const { data } = useQuery({
    queryKey: queryKeys.orders({ status: "PENDING", restockProbe: true }),
    queryFn: async () => {
      const response = await ordersApi.getOrders({
        status: "PENDING",
        limit: PENDING_ORDER_PAGE_SIZE,
      });
      return response.data.items.flatMap((order) =>
        order.items.map((item) => item.productVariantId),
      );
    },
    enabled,
    staleTime: 60_000,
  });

  return useMemo(() => new Set(data ?? []), [data]);
}

export interface RestockStatus {
  /** Still needs buying — drives badges, banner counts and the reorder dialog. */
  active: LowStockItem[];
  /** Already ordered (PENDING order or self-reported): shown as "Đang bổ sung". */
  restockingIds: Set<string>;
  /** Record that the user says they re-purchased this variant elsewhere. */
  markRestocked: (variantId: string) => void;
}

/**
 * Splits the warned products into "still needs buying" and "already on the way".
 *
 * Two independent sources feed the second bucket: a PENDING order the backend has not
 * counted yet, and the user tapping "Đã mua bổ sung" for a purchase made outside the
 * app. Both fall away on their own — the pending order becomes PAID and the backend
 * stops warning, and a self-reported snooze is pruned as soon as the warning clears.
 */
export function useRestockStatus(
  items: LowStockItem[],
  serverDate: string | undefined,
): RestockStatus {
  // Snoozes added during this session. Kept apart from what was already on disk so the
  // read below never needs a cache-buster to see a fresh write.
  const [sessionSnoozes, setSessionSnoozes] = useState<RestockSnooze[]>([]);

  const warnedVariantIds = useMemo(
    () => new Set(items.map((item) => item.variantId)),
    [items],
  );

  const pendingVariantIds = usePendingOrderVariantIds(items.length > 0);

  // `serverDate` only exists once Today has loaded client-side, so there is nothing to
  // read during SSR and no hydration mismatch — same guard the habit ticks use.
  const storedSnoozes = useMemo(
    () =>
      serverDate
        ? parseSnoozes(localStorage.getItem(RESTOCK_SNOOZE_STORAGE_KEY))
        : [],
    [serverDate],
  );

  const snoozedIds = useMemo(() => {
    if (!serverDate) {
      return new Set<string>();
    }
    const live = pruneSnoozes(
      [...storedSnoozes, ...sessionSnoozes],
      warnedVariantIds,
      serverDate,
    );
    return new Set(live.map((entry) => entry.variantId));
  }, [storedSnoozes, sessionSnoozes, warnedVariantIds, serverDate]);

  const markRestocked = useCallback(
    (variantId: string) => {
      if (!serverDate) {
        return;
      }
      const entry: RestockSnooze = { variantId, snoozedAt: serverDate };
      setSessionSnoozes((previous) =>
        previous.some((existing) => existing.variantId === variantId)
          ? previous
          : [...previous, entry],
      );

      const stored = parseSnoozes(
        localStorage.getItem(RESTOCK_SNOOZE_STORAGE_KEY),
      );
      if (stored.some((existing) => existing.variantId === variantId)) {
        return;
      }
      // Prune on write: the read path never writes back, so this is what stops expired
      // entries from piling up in storage.
      const next = [
        ...pruneSnoozes(stored, warnedVariantIds, serverDate),
        entry,
      ];
      localStorage.setItem(RESTOCK_SNOOZE_STORAGE_KEY, JSON.stringify(next));
    },
    [serverDate, warnedVariantIds],
  );

  const restockingIds = useMemo(() => {
    const ids = new Set(snoozedIds);
    for (const variantId of warnedVariantIds) {
      if (pendingVariantIds.has(variantId)) {
        ids.add(variantId);
      }
    }
    return ids;
  }, [snoozedIds, pendingVariantIds, warnedVariantIds]);

  const active = useMemo(
    () => items.filter((item) => !restockingIds.has(item.variantId)),
    [items, restockingIds],
  );

  return { active, restockingIds, markRestocked };
}
