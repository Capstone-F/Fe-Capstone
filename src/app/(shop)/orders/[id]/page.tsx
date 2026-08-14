"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, PackageX, XCircle } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { useOrder } from "@/features/commerce/hooks/useOrders";
import { useOrderDelivery } from "@/features/commerce/hooks/useDelivery";
import { OrderItemRow } from "@/features/commerce/components/order-item-row";
import { OrderStatusBadge } from "@/features/commerce/components/order-status-badge";
import { OrderCardSkeleton } from "@/features/commerce/components/order-card-skeleton";
import { DeliveryTrackingCard } from "@/features/commerce/components/delivery-tracking-card";
import { PayOrderButton } from "@/features/commerce/components/pay-order-button";
import { CancelOrderDialog } from "@/features/commerce/components/cancel-order-dialog";
import { formatOrderCode } from "@/features/commerce/lib/order-hydration";
import { formatVnd } from "@/shared/utils/format";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = {
    title: "Đơn hàng của tôi",
    subtitle: "Theo dõi các đơn hàng bạn đã đặt.",
    filterLabel: "Trạng thái",
    filterAll: "Tất cả",
    perPage: "đơn/trang",
    codeLabel: "Mã đơn",
    placedAt: "Đặt ngày",
    moreItems: "món khác",
    viewDetail: "Xem chi tiết",
    unknownProduct: "Sản phẩm",
    quantityShort: "SL",
    status: {
      PENDING: "Chờ thanh toán",
      PAID: "Đã thanh toán",
      PROCESSING: "Đang xử lý",
      SHIPPED: "Đang giao",
      DELIVERED: "Đã giao",
      CANCELLED: "Đã huỷ",
      REFUNDED: "Đã hoàn tiền",
    },
    loginTitle: "Đăng nhập để xem đơn hàng",
    loginHint: "Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.",
    loginCta: "Đăng nhập",
    emptyTitle: "Chưa có đơn hàng nào",
    emptyHint: "Khám phá cửa hàng và đặt đơn hàng đầu tiên của bạn.",
    emptyCta: "Mua sắm ngay",
    emptyFilteredTitle: "Không có đơn hàng nào ở trạng thái này",
    emptyFilteredHint: "Thử chọn một trạng thái khác hoặc xem tất cả đơn hàng.",
    notFoundTitle: "Không tìm thấy đơn hàng",
    notFoundHint: "Đơn hàng không tồn tại hoặc không thuộc về tài khoản này.",
    backToList: "Quay lại danh sách đơn hàng",
    detailTitle: "Chi tiết đơn hàng",
    itemsHeading: "Sản phẩm đã đặt",
    summaryHeading: "Tổng kết đơn hàng",
    subtotal: "Tạm tính",
    discount: "Giảm giá",
    shipping: "Phí vận chuyển",
    total: "Tổng cộng",
  };
  const [cancelOpen, setCancelOpen] = useState(false);
  const { order, items, isLoading, isNotFound } = useOrder(id);
  // Deferred until the order is known to exist and belong to this customer.
  // Orders placed before the GHN migration have no delivery row and 404 here.
  const { delivery } = useOrderDelivery(order ? id : "");

  const canCancel =
    order?.status === "PENDING" || order?.status === "PROCESSING";

  return (
    <div className="p-4 md:p-6 lg:p-8">
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
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                {canCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelOpen(true)}
                    className="h-8 rounded-xl border-rose-200 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Hủy đơn
                  </Button>
                )}
                {order.status === "PENDING" && (
                  <PayOrderButton orderId={order.id} />
                )}
              </div>
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

            {delivery && <DeliveryTrackingCard delivery={delivery} />}

            <CancelOrderDialog
              isOpen={cancelOpen}
              onClose={() => setCancelOpen(false)}
              orderId={order.id}
            />
          </>
        )}
      </div>
    </div>
  );
}
