import { useState } from "react";
import Link from "next/link";
import { ChevronRight, RotateCcw, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { HydratedOrder, useReorder } from "../hooks/useOrders";
import { formatVnd } from "@/shared/utils/format";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderSourceBadge } from "./order-source-badge";
import { OrderItemRow } from "./order-item-row";
import { CancelOrderDialog } from "./cancel-order-dialog";

const PREVIEW_LIMIT = 2;

export function OrderCard({ entry }: { entry: HydratedOrder }) {
  const router = useRouter();
  const [cancelOpen, setCancelOpen] = useState(false);
  const reorderMutation = useReorder();

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
  };
  const { order, items } = entry;
  const preview = items.slice(0, PREVIEW_LIMIT);
  const hiddenCount = items.length - preview.length;

  const canCancel = order.status === "PENDING" || order.status === "PROCESSING";
  const canReorder =
    order.status === "DELIVERED" || order.status === "CANCELLED";

  const handleReorder = () => {
    reorderMutation.mutate(order.id, {
      onSuccess: () => {
        toast.success("Đã thêm các sản phẩm vào giỏ hàng!");
        router.push("/cart");
      },
      onError: (err) => {
        toast.error((err as Error)?.message || "Không thể thực hiện mua lại.");
      },
    });
  };

  return (
    <>
      <Card className="overflow-hidden border-slate-200 shadow-xs transition-colors hover:border-slate-300">
        <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
          <span className="text-xs font-semibold text-slate-700">
            Đơn hàng ngày{" "}
            {new Date(order.createdAt).toLocaleDateString("vi-VN")}
          </span>
          <div className="flex items-center gap-3">
            <OrderSourceBadge source={order.source} />
            <span className="text-muted-foreground text-[10px]">
              {t.placedAt}{" "}
              {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <CardContent className="p-4 pt-0">
          <div className="divide-y divide-slate-100">
            {preview.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </div>
          {hiddenCount > 0 ? (
            <p className="text-muted-foreground pt-2 text-xs">
              và {hiddenCount} {t.moreItems}
            </p>
          ) : null}
        </CardContent>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <span className="text-sm font-bold text-slate-900">
            {formatVnd(order.totalVnd)}
          </span>
          <div className="flex items-center gap-2">
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
            {canReorder && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={reorderMutation.isPending}
                onClick={handleReorder}
                className="h-8 rounded-xl text-xs"
              >
                {reorderMutation.isPending ? (
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="mr-1 h-3.5 w-3.5" />
                )}
                Mua lại
              </Button>
            )}
            <Link
              href={`/orders/${order.id}`}
              className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-xs font-semibold"
            >
              {t.viewDetail}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Card>

      <CancelOrderDialog
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        orderId={order.id}
      />
    </>
  );
}
