"use client";

import * as React from "react";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import {
  DashboardEmptyPanel,
  DashboardMetricCard,
  DashboardSectionCard,
  formatCurrency,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import { useOrderCancellations } from "@/features/admin/cancellations/hooks/useCancellations";
import { CancellationDetailModal } from "@/features/admin/cancellations/components/cancellation-detail-modal";
import type {
  OrderCancellation,
  OrderCancellationStatus,
} from "@/features/admin/cancellations/types/cancellation.types";
import type { MoneyFlow } from "../types/finance.types";

const PAGE_SIZE = 20;

const STATUS_ITEMS: Record<string, string> = {
  ALL: "Tất cả trạng thái",
  REQUESTED: "Mới yêu cầu",
  REFUNDING: "Đang hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
  AWAITING_RETURN: "Chờ nhận hàng trả",
  RESTOCKED: "Đã nhập lại kho",
  COMPLETED: "Hoàn tất",
  FAILED: "Lỗi",
};

export function RefundOutflowTab({ flow }: { flow: MoneyFlow }) {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<string>("ALL");
  const [selected, setSelected] = React.useState<OrderCancellation | null>(
    null,
  );

  // Counts, not amounts — summing đồng amounts here would mean paging the
  // filtered set client-side, the exact bounded-fetch pattern this phase
  // exists to delete. `total` comes free and exact from the response, and a
  // count is the more actionable number for "how many need intervention."
  // limit: 1 because only `total` is read — no reason to transfer rows.
  const inFlight = useOrderCancellations({
    status: "REFUNDING",
    page: 1,
    limit: 1,
  });
  const stuck = useOrderCancellations({ status: "FAILED", page: 1, limit: 1 });

  // Returns unwrapped `{ items, total, page, limit }` and polls every 10s.
  const query = useOrderCancellations({
    status: status as OrderCancellationStatus | "ALL",
    page,
    limit: PAGE_SIZE,
  });

  const items = React.useMemo(() => query.data?.items ?? [], [query.data]);
  const total = query.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  // The list polls every 10s; prefer the freshest copy of the selected record so
  // a status flip (e.g. REFUNDING -> FAILED) shows while the modal is open.
  // Fall back to the snapshot so the modal doesn't vanish if the record leaves
  // the current page under a filter or pagination change.
  const liveSelected = React.useMemo(() => {
    if (!selected) return null;
    return items.find((item) => item.id === selected.id) ?? selected;
  }, [selected, items]);

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium">
          Trong kỳ đang chọn
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardMetricCard
            icon={RefreshCw}
            label="Hoàn tiền sản phẩm"
            value={formatCurrency(flow.productRefundsVnd)}
          />
          <DashboardMetricCard
            icon={RefreshCw}
            label="Hoàn phí tư vấn"
            value={formatCurrency(flow.consultationRefundsVnd)}
          />
          <DashboardMetricCard
            icon={RefreshCw}
            label="Hoàn phí phác đồ"
            value={formatCurrency(flow.treatmentRefundsVnd)}
          />
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs font-medium">
          Trạng thái hiện tại, không phụ thuộc kỳ
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardMetricCard
            icon={Clock}
            label="Đang hoàn tiền"
            value={
              inFlight.isPending || inFlight.isError
                ? "—"
                : `${inFlight.data.total} yêu cầu`
            }
          />
          <DashboardMetricCard
            icon={AlertTriangle}
            label="Đang kẹt (lỗi)"
            value={
              stuck.isPending || stuck.isError
                ? "—"
                : `${stuck.data.total} yêu cầu`
            }
          />
        </div>
      </section>

      <DashboardSectionCard
        title="Danh sách hoàn tiền"
        description="Lọc theo trạng thái; phân trang lấy từ máy chủ"
      >
        <div className="mb-4 max-w-xs">
          <Select
            value={status}
            items={STATUS_ITEMS}
            onValueChange={(value) => {
              setStatus(value || "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Lọc theo trạng thái hoàn tiền">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {items.length === 0 ? (
          <DashboardEmptyPanel
            title="Không có yêu cầu hoàn tiền"
            description="Không có bản ghi nào khớp bộ lọc hiện tại."
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Số tiền hoàn</TableHead>
                  <TableHead>Ghi chú lỗi</TableHead>
                  <TableHead className="text-right">Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const open = () => setSelected(item);

                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={open}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault(); // Space would otherwise scroll the page
                          open();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Đơn #${item.orderId.slice(0, 8)} — xem chi tiết hoàn tiền`}
                    >
                      <TableCell className="font-mono text-xs">
                        #{item.orderId.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "FAILED" ? "destructive" : "outline"
                          }
                        >
                          {STATUS_ITEMS[item.status] ?? item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.refundAmountVnd)}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-56 truncate text-xs">
                        {item.lastError ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-xs">
                        {formatDateTime(item.createdAt)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <DataTablePagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </DashboardSectionCard>

      {/* Reused from the cancellations feature — do not rebuild. */}
      <CancellationDetailModal
        cancellation={liveSelected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        isAdmin
      />
    </div>
  );
}
