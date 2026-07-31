"use client";

import { Package, Truck } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Delivery, DeliveryStatus } from "../types/delivery";

const t = {
  heading: "Vận chuyển",
  carrier: "Đơn vị vận chuyển",
  carrierName: "Giao Hàng Nhanh (GHN)",
  trackingCode: "Mã vận đơn",
  awaitingCode: "Đang tạo vận đơn...",
  expected: "Dự kiến giao",
  shippedAt: "Đã lấy hàng",
  deliveredAt: "Đã giao",
  recipient: "Người nhận",
  fee: "Phí vận chuyển",
  history: "Lịch sử vận chuyển",
  noHistory: "Chưa có cập nhật từ đơn vị vận chuyển.",
};

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  PENDING: "Chờ xử lý",
  PROCESSING: "Đang chuẩn bị",
  SHIPPED: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  FAILED: "Giao thất bại",
  RETURNED: "Đã hoàn trả",
};

const STATUS_CLASS: Record<DeliveryStatus, string> = {
  PENDING: "bg-slate-100 text-slate-600",
  PROCESSING: "bg-primary-soft text-primary",
  SHIPPED: "bg-primary-soft text-primary",
  IN_TRANSIT: "bg-primary-soft text-primary",
  DELIVERED: "bg-success-soft text-success",
  FAILED: "bg-destructive/10 text-destructive",
  RETURNED: "bg-warning-soft text-warning",
};

function formatDateTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString("vi-VN");
}

/**
 * Delivery status for one order. Shows exactly what GET /delivery/order/:orderId
 * returns — the API exposes only recipientName and streetAddress, not the
 * province/district/ward the order was placed with (see ADR-044).
 */
export function DeliveryTrackingCard({ delivery }: { delivery: Delivery }) {
  const expected = formatDateTime(delivery.expectedDeliveryTime);
  const shipped = formatDateTime(delivery.shippedAt);
  const delivered = formatDateTime(delivery.deliveredAt);
  const recipient = [delivery.recipientName, delivery.streetAddress]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Truck className="h-4 w-4 text-slate-400" />
            {t.heading}
          </h3>
          <Badge
            className={cn(
              "rounded-full border-0 text-xs font-semibold",
              STATUS_CLASS[delivery.status],
            )}
          >
            {STATUS_LABEL[delivery.status]}
          </Badge>
        </div>

        <dl className="flex flex-col gap-2 text-sm">
          <InfoRow label={t.carrier} value={t.carrierName} />
          <InfoRow
            label={t.trackingCode}
            value={delivery.providerOrderCode ?? t.awaitingCode}
            mono={delivery.providerOrderCode !== null}
          />
          {expected && <InfoRow label={t.expected} value={expected} />}
          {shipped && <InfoRow label={t.shippedAt} value={shipped} />}
          {delivered && <InfoRow label={t.deliveredAt} value={delivered} />}
          {recipient && <InfoRow label={t.recipient} value={recipient} />}
        </dl>

        <div className="border-t border-slate-100 pt-3">
          <h4 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            {t.history}
          </h4>
          {delivery.statusEvents.length === 0 ? (
            <p className="text-muted-foreground text-xs">{t.noHistory}</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {delivery.statusEvents.map((event, index) => (
                <li
                  key={`${event.providerStatus}-${event.occurredAt}`}
                  className="flex items-start gap-2 text-xs"
                >
                  <span
                    className={cn(
                      "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                      index === 0 ? "bg-primary" : "bg-slate-300",
                    )}
                  />
                  <span className="font-medium text-slate-700">
                    {event.providerStatus}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    {formatDateTime(event.occurredAt) ?? event.occurredAt}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground shrink-0">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium text-slate-800",
          mono && "font-mono",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
