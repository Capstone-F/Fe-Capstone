import { CartSummary } from "@/types/domain";
import { formatVnd } from "@/shared/utils/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

interface OrderSummaryProps {
  summary: CartSummary;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
}

export function OrderSummary({
  summary,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: OrderSummaryProps) {
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
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="text-base font-bold text-slate-900">
          {cc.total}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 p-4 text-sm">
        <Row label={cc.subtotal} value={formatVnd(summary.subtotal)} />
        <Row
          label={cc.shipping}
          value={
            summary.shippingFee === 0
              ? cc.freeShip
              : formatVnd(summary.shippingFee)
          }
        />
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
          <span>{cc.total}</span>
          <span className="text-primary">{formatVnd(summary.total)}</span>
        </div>
        {primaryLabel && (
          <Button
            size="lg"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className="mt-1 w-full rounded-lg font-semibold"
          >
            {primaryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}
