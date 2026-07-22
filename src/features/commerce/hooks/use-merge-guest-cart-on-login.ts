"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query/keys";
import { vi } from "@/config/locales/vi";
import { useSession } from "@/features/auth/hooks/use-session";
import { ApiError } from "@/lib/api/client";
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
      .then(({ droppedVariantIds }) => {
        clearGuestCart();
        queryClient.invalidateQueries({ queryKey: queryKeys.cart });

        if (droppedVariantIds.length > 0) {
          toast.success(vi.commerce.nav.cartMerged, {
            description:
              "Mot vai san pham demo cu khong con hop le nen da duoc bo qua.",
          });
          return;
        }

        toast.success(vi.commerce.nav.cartMerged);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 400) {
          clearGuestCart();
          queryClient.invalidateQueries({ queryKey: queryKeys.cart });
          toast.error(
            "Giỏ hàng tam chua du lieu cu khong hop le nen da duoc xoa de tranh lap yeu cau loi.",
          );
          return;
        }

        // Allow a retry on the next mount/login; keep the local cart.
        mergedRef.current = false;
        toast.error(vi.commerce.nav.cartMergeFailed);
      });
  }, [session.data, queryClient]);
}
