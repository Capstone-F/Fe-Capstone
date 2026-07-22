import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { HydratedOrder } from "../hooks/useOrders";
import { formatOrderCode } from "../lib/order-hydration";
import { formatVnd } from "@/shared/utils/format";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderItemRow } from "./order-item-row";

const PREVIEW_LIMIT = 2;

export function OrderCard({ entry }: { entry: HydratedOrder }) {
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
  const { order, items } = entry;
  const preview = items.slice(0, PREVIEW_LIMIT);
  const hiddenCount = items.length - preview.length;

  return (
    <Card className="overflow-hidden border-slate-200 shadow-xs transition-colors hover:border-slate-300">
      <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-[10px]">
            {t.codeLabel}
          </span>
          <span className="font-mono text-xs font-bold text-slate-700">
            {formatOrderCode(order.id)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-[10px]">
            {t.placedAt} {new Date(order.createdAt).toLocaleDateString("vi-VN")}
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
        <Link
          href={`/orders/${order.id}`}
          className="text-primary hover:text-primary-hover inline-flex items-center gap-1 text-xs font-semibold"
        >
          {t.viewDetail}
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
