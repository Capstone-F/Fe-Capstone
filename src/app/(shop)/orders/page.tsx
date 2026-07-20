"use client";

import { useState } from "react";
import { PackageSearch, LogIn } from "lucide-react";
import { vi } from "@/config/locales/vi";
import { OrderStatus } from "@/types/domain";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/features/commerce/hooks/use-orders";
import { OrderCard } from "@/features/commerce/components/order-card";
import { OrderCardSkeleton } from "@/features/commerce/components/order-card-skeleton";
import { ProductPagination } from "@/features/commerce/components/product-pagination";

const PAGE_SIZE_OPTIONS = [5, 10, 20];
const ALL_STATUSES = "ALL";

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function OrdersPage() {
  const t = vi.commerce.orders;
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

  // Any filter or page-size change invalidates the current page number.
  // Base UI's Select emits null when cleared; fall back to the "all" option.
  const handleStatusChange = (
    value: OrderStatus | typeof ALL_STATUSES | null,
  ) => {
    setStatus(value ?? ALL_STATUSES);
    setPage(1);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.title}
        </h2>
        <p className="text-muted-foreground text-sm">{t.subtitle}</p>
      </div>

      {!isAuthenticated && !isLoading ? (
        <EmptyState
          icon={LogIn}
          title={t.loginTitle}
          description={t.loginHint}
          action={{ label: t.loginCta, href: "/login" }}
        />
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">
              {t.filterLabel}
            </span>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger size="sm" className="w-44 text-xs">
                {/* Base UI renders the raw value by default, which would show
                    the enum ("DELIVERED") instead of its Vietnamese label. */}
                <SelectValue>
                  {(value: OrderStatus | typeof ALL_STATUSES) =>
                    value === ALL_STATUSES ? t.filterAll : t.status[value]
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>{t.filterAll}</SelectItem>
                {STATUS_ORDER.map((value) => (
                  <SelectItem key={value} value={value}>
                    {t.status[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <OrderCardSkeleton key={index} />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="flex flex-col gap-4">
              {orders.map((entry) => (
                <OrderCard key={entry.order.id} entry={entry} />
              ))}
              <ProductPagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                perPageLabel={t.perPage}
              />
            </div>
          ) : status !== ALL_STATUSES ? (
            // The user has orders, just none in this status — don't tell them
            // to place their first order.
            <EmptyState
              icon={PackageSearch}
              title={t.emptyFilteredTitle}
              description={t.emptyFilteredHint}
            />
          ) : (
            <EmptyState
              icon={PackageSearch}
              title={t.emptyTitle}
              description={t.emptyHint}
              action={{ label: t.emptyCta, href: "/products" }}
            />
          )}
        </>
      )}
    </div>
  );
}
