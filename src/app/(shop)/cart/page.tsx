"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { vi } from "@/config/locales/vi";
import {
  useCart,
  useRemoveFromCart,
  useUpdateQuantity,
} from "@/features/commerce/hooks/use-cart";
import { detectCartConflicts } from "@/features/commerce/lib/conflicts";
import { CartItemRow } from "@/features/commerce/components/cart-item-row";
import { OrderSummary } from "@/features/commerce/components/order-summary";
import { ConflictWarning } from "@/features/commerce/components/conflict-warning";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const cc = vi.commerce.cart;

export default function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const updateQuantity = useUpdateQuantity();
  const removeFromCart = useRemoveFromCart();
  const [acknowledged, setAcknowledged] = useState(false);

  const lines = cart?.lines ?? [];
  const conflicts = detectCartConflicts(lines.map((line) => line.product));
  const blockedByConflict = conflicts.length > 0 && !acknowledged;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {cc.title}
        </h2>
        <p className="text-muted-foreground text-sm">{cc.subtitle}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3 md:col-span-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-24 w-full rounded-xl bg-slate-300"
              />
            ))}
          </div>
          <Skeleton className="h-56 w-full rounded-xl bg-slate-300 md:col-span-1" />
        </div>
      ) : lines.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <ShoppingCart className="mb-3 h-12 w-12 text-slate-300" />
          <p className="font-bold text-slate-700">{cc.emptyTitle}</p>
          <p className="mt-1 text-xs">{cc.emptyHint}</p>
          <Link href="/products">
            <Button variant="outline" size="sm" className="mt-4 text-xs">
              {cc.continueShopping}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3 md:col-span-2">
            <ConflictWarning
              conflicts={conflicts}
              acknowledged={acknowledged}
              onAcknowledgeChange={setAcknowledged}
            />
            {lines.map((line) => (
              <CartItemRow
                key={line.product.id}
                line={line}
                onUpdateQuantity={(productId, quantity) =>
                  updateQuantity.mutate({ productId, quantity })
                }
                onRemove={(productId) => removeFromCart.mutate(productId)}
              />
            ))}
          </div>
          <div className="md:col-span-1">
            <div className="sticky top-6">
              {cart && (
                <OrderSummary
                  summary={cart}
                  primaryLabel={cc.checkout}
                  primaryDisabled={blockedByConflict}
                  onPrimary={() => router.push("/checkout")}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
