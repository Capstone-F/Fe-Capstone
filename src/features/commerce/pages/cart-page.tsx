"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import {
  useCart,
  useRemoveFromCart,
  useUpdateQuantity,
} from "@/features/commerce/hooks/useCart";
import { CartItemRow } from "@/features/commerce/components/cart-item-row";
import { OrderSummary } from "@/features/commerce/components/order-summary";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { EmptyState } from "@/shared/components/ui/empty-state";

const cc = {
  title: "Giỏ hàng của tôi",
  subtitle: "Xem lại sản phẩm trước khi thanh toán.",
  emptyTitle: "Giỏ hàng đang trống",
  emptyHint: "Khám phá cửa hàng và thêm sản phẩm bạn yêu thích.",
  continueShopping: "Tiếp tục mua sắm",
  remove: "Xóa",
  subtotal: "Tạm tính",
  shipping: "Phí vận chuyển",
  freeShip: "Miễn phí",
  total: "Tổng cộng",
  checkout: "Tiến hành thanh toán",
  itemsCount: "sản phẩm",
  unresolvedItemsNote:
    "sản phẩm trong giỏ không tải được thông tin hiển thị (đã ẩn khỏi danh sách).",
};

export function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading } = useCart();
  const updateQuantity = useUpdateQuantity();
  const removeFromCart = useRemoveFromCart();

  const lines = cart?.lines ?? [];

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
        <EmptyState
          icon={ShoppingCart}
          title={cc.emptyTitle}
          description={cc.emptyHint}
          action={{ label: cc.continueShopping, href: "/products" }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-3 md:col-span-2">
            {cart && cart.unresolvedVariantIds.length > 0 && (
              <p className="bg-warning-soft text-warning rounded-xl px-3 py-2 text-xs">
                {cart.unresolvedVariantIds.length} {cc.unresolvedItemsNote}
              </p>
            )}
            {lines.map((line) => (
              <CartItemRow
                key={line.variant.id}
                line={line}
                onUpdateQuantity={(variantId, quantity) =>
                  updateQuantity.mutate({
                    productVariantId: variantId,
                    quantity,
                  })
                }
                onRemove={(variantId) => removeFromCart.mutate(variantId)}
              />
            ))}
          </div>
          <div className="md:col-span-1">
            <div className="sticky top-6">
              {cart && (
                <OrderSummary
                  summary={cart}
                  primaryLabel={cc.checkout}
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
