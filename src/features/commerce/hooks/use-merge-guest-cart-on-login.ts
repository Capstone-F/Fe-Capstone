"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { vi } from "@/config/locales/vi";
import { useSession } from "@/features/auth/hooks/use-session";
import {
  clearGuestCart,
  readGuestCart,
} from "@/features/commerce/api/guest-cart";
import { mergeGuestCartIntoServer } from "@/features/commerce/api/merge-guest-cart";

/**
 * When the session transitions to authenticated and a guest cart exists,
 * merge it into the server cart exactly once, then clear local storage.
 * Best-effort: on failure the local cart is left intact and retried next time.
 */
export function useMergeGuestCartOnLogin(): void {
  const session = useSession();
  const queryClient = useQueryClient();
  const mergedRef = useRef(false);

  useEffect(() => {
    if (!session.data || mergedRef.current) {
      return;
    }
    const guestItems = readGuestCart();
    if (guestItems.length === 0) {
      mergedRef.current = true;
      return;
    }
    mergedRef.current = true;
    mergeGuestCartIntoServer(guestItems)
      .then(() => {
        clearGuestCart();
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });
        toast.success(vi.commerce.nav.cartMerged);
      })
      .catch(() => {
        // Allow a retry on the next mount/login; keep the local cart.
        mergedRef.current = false;
        toast.error(vi.commerce.nav.cartMergeFailed);
      });
  }, [session.data, queryClient]);
}
