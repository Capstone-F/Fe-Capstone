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
import { buildRefundTotals } from "../lib/flow";

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

export function RefundOutflowTab({
  allCancellations,
}: {
  allCancellations: OrderCancellation[];
}) {
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState<string>("ALL");
  const [selected, setSelected] = React.useState<OrderCancellation | null>(
    null,
  );

  // Totals come from the bounded whole-set fetch, NOT from `items` — so they
  // describe the period rather than the visible page. See spec §5.2.
  const totals = React.useMemo(
    () => buildRefundTotals(allCancellations),
    [allCancellations],
  );

  // Returns unwrapped `{ items, total, page, limit }` and polls every 10s.
  const query = useOrderCancellations({
    status: status as OrderCancellationStatus | "ALL",
    page,
    limit: PAGE_SIZE,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4 sm:grid-cols-3">
        <DashboardMetricCard
          icon={RefreshCw}
          label="Đã hoàn cho khách"
          value={formatCurrency(totals.refundedOutVnd)}
          hint="Tiền đã rời khỏi nền tảng"
        />
        <DashboardMetricCard
          icon={Clock}
          label="Đang xử lý"
          value={formatCurrency(totals.inFlightVnd)}
          hint="Chưa hoàn xong"
        />
        <DashboardMetricCard
          icon={AlertTriangle}
          label="Đang kẹt (lỗi)"
          value={formatCurrency(totals.stuckVnd)}
          hint="Cần can thiệp thủ công"
        />
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
        cancellation={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        isAdmin
      />
    </div>
  );
}
