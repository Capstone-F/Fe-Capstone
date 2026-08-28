"use client";

import { useState } from "react";
import { Info, PackageSearch } from "lucide-react";
import { OrderStatusBadge } from "@/features/commerce/components/order-status-badge";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import {
  formatDate,
  formatDateTime,
} from "@/features/dashboard/components/dashboard-shell";
import { formatVnd } from "@/shared/utils/format";
import { useStockImportFormSalesLog } from "../hooks/useStock";
import { StockImportFormStatus, StockMovementType } from "../types/stock.types";

const SALES_LOG_PAGE_SIZE = 20;

const MOVEMENT_LABELS: Record<StockMovementType, string> = {
  [StockMovementType.SALE]: "Bán hàng",
  [StockMovementType.RETURN]: "Trả hàng",
};

export function SalesLogPanel({
  formId,
  formStatus,
}: {
  formId: string;
  formStatus: string;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useStockImportFormSalesLog(formId, {
    page,
    limit: SALES_LOG_PAGE_SIZE,
  });

  if (formStatus !== StockImportFormStatus.CONFIRMED) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-800">
        <PackageSearch className="h-8 w-8 text-slate-300 dark:text-slate-600" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Phiếu chưa được xác nhận, chưa có dữ liệu bán hàng.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !data || !data.batch) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-rose-200 p-8 text-center dark:border-rose-900">
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
          Không tải được log bán hàng. Vui lòng thử lại.
        </p>
      </div>
    );
  }

  const { batch, entries, movements, total } = data;

  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <span className="text-slate-500">Mã lô:</span>
          <p className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            {batch.batchCode}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Nhập ban đầu:</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {batch.initialQuantity}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Còn lại:</span>
          <p className="font-bold text-[#2C3E35] dark:text-emerald-400">
            {batch.remainingQuantity}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Đã bán:</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {batch.soldQuantity}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Đã trả:</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {batch.returnedQuantity}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Hư hỏng:</span>
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {batch.damagedQuantity}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-3">
          <span className="text-slate-500">Hạn sử dụng:</span>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {batch.expirationDate ? formatDate(batch.expirationDate) : "—"}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">SL đặt</TableHead>
                <TableHead className="text-right">
                  <span className="inline-flex items-center gap-1">
                    SL từ lô này
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Info className="h-3 w-3 cursor-help text-slate-400" />
                        }
                      />
                      <TooltipContent>
                        Một đơn hàng có thể lấy hàng từ nhiều lô (trừ kho theo
                        FEFO), nên số lượng này có thể nhỏ hơn số lượng đặt.
                      </TooltipContent>
                    </Tooltip>
                  </span>
                </TableHead>
                <TableHead className="text-right">Đã bán</TableHead>
                <TableHead className="text-right">Đã trả</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead>Thời điểm trừ kho</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-muted-foreground h-24 text-center"
                  >
                    Chưa có đơn hàng nào tiêu thụ hàng từ lô này.
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.orderItemId}>
                    <TableCell className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      #{entry.orderId.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={entry.orderStatus} />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        {entry.customerName || "Khách vãng lai"}
                      </p>
                      <p className="text-slate-400">
                        {entry.customerEmail || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.orderedQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.quantityFromBatch}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.soldQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.returnedQuantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatVnd(entry.unitPriceVnd)}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {entry.stockDeductedAt
                        ? formatDateTime(entry.stockDeductedAt)
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          page={page}
          totalPages={Math.max(1, Math.ceil(total / SALES_LOG_PAGE_SIZE))}
          totalItems={total}
          pageSize={SALES_LOG_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Lịch sử biến động lô hàng
        </p>
        {movements.length === 0 ? (
          <p className="text-slate-400">Chưa có biến động nào.</p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                      {MOVEMENT_LABELS[movement.type]}
                    </TableCell>
                    <TableCell className="text-right">
                      {movement.quantity}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {movement.note || "—"}
                    </TableCell>
                    <TableCell className="text-slate-500">
                      {formatDateTime(movement.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
