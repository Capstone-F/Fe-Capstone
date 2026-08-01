import { HydratedOrderItem } from "../lib/order-hydration";
import { formatVnd } from "@/shared/utils/format";
import { CategoryPlaceholder } from "./category-placeholder";

/**
 * A single purchased line. `product` is null when the variant's product has
 * left the catalog — the line still renders with its historical prices.
 */
export function OrderItemRow({ item }: { item: HydratedOrderItem }) {
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
  const name = item.product?.name ?? "Sản phẩm không còn trong danh mục";

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200">
        {item.product ? (
          <CategoryPlaceholder categoryName={item.product.categoryName} />
        ) : (
          <div className="h-full w-full bg-slate-50" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
        {item.product ? (
          <p className="text-muted-foreground truncate text-xs">
            {item.product.brandName}
          </p>
        ) : null}
        <p className="text-muted-foreground mt-0.5 text-xs">
          {t.quantityShort} {item.quantity} × {formatVnd(item.unitPriceVnd)}
        </p>
      </div>

      <span className="shrink-0 text-sm font-bold text-slate-800">
        {formatVnd(item.lineTotalVnd)}
      </span>
    </div>
  );
}
