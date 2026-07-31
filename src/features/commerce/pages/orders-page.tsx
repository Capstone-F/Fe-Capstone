"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, PackageSearch } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useOrders } from "@/features/commerce/hooks/useOrders";
import { OrderCard } from "@/features/commerce/components/order-card";
import { OrderCardSkeleton } from "@/features/commerce/components/order-card-skeleton";
import { ProductPagination } from "@/features/commerce/components/product-pagination";
import type { OrderStatus } from "@/types/domain";

const t = {
  title: "Đơn hàng của tôi",
  subtitle: "Theo dõi các đơn hàng bạn đã đặt.",
  filterLabel: "Trạng thái",
  filterAll: "Tất cả",
  perPage: "đơn/trang",
  loginTitle: "Đăng nhập để xem đơn hàng",
  loginHint: "Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.",
  loginCta: "Đăng nhập",
  emptyTitle: "Chưa có đơn hàng nào",
  emptyHint: "Khám phá cửa hàng và đặt đơn hàng đầu tiên của bạn.",
  emptyCta: "Mua sắm ngay",
  emptyFilteredTitle: "Không có đơn hàng nào ở trạng thái này",
  emptyFilteredHint: "Thử chọn một trạng thái khác hoặc xem tất cả đơn hàng.",
  status: {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã huỷ",
    REFUNDED: "Đã hoàn tiền",
  } satisfies Record<OrderStatus, string>,
};

const STATUS_VALUES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const ALL_STATUSES = "ALL";
const PAGE_SIZE_OPTIONS = [5, 10, 20];
const SKELETON_COUNT = 3;

export function OrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | typeof ALL_STATUSES>(
    ALL_STATUSES,
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { orders, total, isLoading, isAuthenticated } = useOrders({
    status: status === ALL_STATUSES ? undefined : status,
    page,
    limit: pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (!isLoading && !isAuthenticated) {
    return (
      <EmptyState
        icon={ClipboardList}
        title={t.loginTitle}
        description={t.loginHint}
        action={{
          label: t.loginCta,
          onClick: () => router.push("/login?redirectTo=/orders"),
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.title}
          </h2>
          <p className="text-muted-foreground text-sm">{t.subtitle}</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">
            {t.filterLabel}
          </span>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as OrderStatus | typeof ALL_STATUSES);
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>{t.filterAll}</SelectItem>
              {STATUS_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {t.status[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <OrderCardSkeleton key={index} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title={status === ALL_STATUSES ? t.emptyTitle : t.emptyFilteredTitle}
          description={
            status === ALL_STATUSES ? t.emptyHint : t.emptyFilteredHint
          }
          action={
            status === ALL_STATUSES
              ? { label: t.emptyCta, href: "/products" }
              : undefined
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {orders.map((entry) => (
              <OrderCard key={entry.order.id} entry={entry} />
            ))}
          </div>
          <ProductPagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(next) => {
              setPageSize(next);
              setPage(1);
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            perPageLabel={t.perPage}
          />
        </>
      )}
    </div>
  );
}
