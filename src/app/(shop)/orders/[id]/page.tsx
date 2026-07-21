"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, PackageX } from "lucide-react";
import { vi } from "@/config/locales/vi";
import { Card, CardContent } from "@/shared/components/ui/card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { useOrder } from "@/features/commerce/hooks/use-orders";
import { OrderItemRow } from "@/features/commerce/components/order-item-row";
import { OrderStatusBadge } from "@/features/commerce/components/order-status-badge";
import { OrderCardSkeleton } from "@/features/commerce/components/order-card-skeleton";
import { formatOrderCode } from "@/features/commerce/lib/order-hydration";
import { formatVnd } from "@/shared/utils/format";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = vi.commerce.orders;
  const { order, items, isLoading, isNotFound } = useOrder(id);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href="/orders"
        className="text-muted-foreground inline-flex items-center gap-1 text-xs font-medium hover:text-slate-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.backToList}
      </Link>

      {isLoading ? (
        <OrderCardSkeleton />
      ) : isNotFound || !order ? (
        <EmptyState
          icon={PackageX}
          title={t.notFoundTitle}
          description={t.notFoundHint}
          action={{ label: t.backToList, href: "/orders" }}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {t.detailTitle}
              </h2>
              <p className="text-muted-foreground text-sm">
                <span className="font-mono font-bold text-slate-700">
                  {formatOrderCode(order.id)}
                </span>
                {" · "}
                {t.placedAt}{" "}
                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          <Card className="border-slate-200 shadow-xs">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-bold text-slate-800">
                {t.itemsHeading}
              </h3>
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <OrderItemRow key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs">
            <CardContent className="flex flex-col gap-2 p-4">
              <h3 className="mb-1 text-sm font-bold text-slate-800">
                {t.summaryHeading}
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.subtotal}</span>
                <span className="text-slate-700">
                  {formatVnd(order.subtotalVnd)}
                </span>
              </div>
              {order.discountVnd > 0 ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.discount}</span>
                  <span className="text-success">
                    −{formatVnd(order.discountVnd)}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.shipping}</span>
                <span className="text-slate-700">
                  {formatVnd(order.shippingFeeVnd)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-bold text-slate-900">
                  {t.total}
                </span>
                <span className="text-lg font-bold text-slate-900">
                  {formatVnd(order.totalVnd)}
                </span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
