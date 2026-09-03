"use client";

import React, { useState } from "react";
import { PackageCheck, RefreshCw, Eye, Filter, Wallet } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { formatVnd } from "@/shared/utils/format";
import { useOrderCancellations } from "../hooks/useCancellations";
import type {
  OrderCancellation,
  OrderCancellationStatus,
} from "../types/cancellation.types";
import { ConfirmReturnModal } from "./confirm-return-modal";
import { CancellationDetailModal } from "./cancellation-detail-modal";
import { DataTablePagination } from "@/shared/components/ui/data-table-pagination";

const statusBadges: Record<
  string,
  { label: string; class: string; desc: string }
> = {
  REQUESTED: {
    label: "Yêu cầu hủy đơn",
    class: "bg-blue-100 text-blue-800",
    desc: "Đang chờ tiến trình tự động khởi chạy",
  },
  REFUNDING: {
    label: "Đang hoàn tiền ví",
    class: "bg-amber-100 text-amber-800",
    desc: "Đang tính toán và xử lý hoàn tiền ví",
  },
  REFUNDED: {
    label: "Đã hoàn tiền ví",
    class: "bg-purple-100 text-purple-800",
    desc: "Đã cộng tiền vào ví khách hàng",
  },
  AWAITING_RETURN: {
    label: "Chờ nhập kho",
    class:
      "bg-orange-500 text-white font-extrabold shadow-xs animate-pulse border border-orange-600",
    desc: "Cần nhân viên kiểm kê và xác nhận hàng tốt/hỏng",
  },
  RESTOCKED: {
    label: "Đã nhập kho",
    class: "bg-emerald-100 text-emerald-800 font-bold",
    desc: "Đã hoàn tất kiểm kê hàng nhập kho",
  },
  COMPLETED: {
    label: "Hoàn tất",
    class: "bg-emerald-700 text-white font-bold",
    desc: "Hoàn tất toàn bộ quy trình hủy đơn",
  },
  FAILED: {
    label: "Xử lý lỗi",
    class: "bg-rose-600 text-white font-extrabold",
    desc: "Tiến trình gặp lỗi, cần xử lý",
  },
};

interface RestockQueueTableProps {
  isAdmin?: boolean;
}

export function RestockQueueTable({ isAdmin = false }: RestockQueueTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<
    OrderCancellationStatus | "ALL"
  >("AWAITING_RETURN");
  const [page, setPage] = useState(1);

  const [confirmModalItem, setConfirmModalItem] =
    useState<OrderCancellation | null>(null);
  const [detailModalItem, setDetailModalItem] =
    useState<OrderCancellation | null>(null);

  const { data, isLoading, refetch, isRefetching } = useOrderCancellations({
    status: selectedStatus,
    page,
    limit: 15,
  });

  const cancellations = data?.items || [];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* ── Header Welcome ── */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Bàn Kiểm Hàng Trả & Quản Lý Hủy Đơn
            </h2>
            <p className="text-xs text-slate-500">
              Kiểm kê hàng hóa vật lý trả về kho và quản lý quy trình hoàn tiền
              ví khách hàng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      {/* ── Top Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <PackageCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Chờ Kiểm Nhập Kho
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.total ?? cancellations.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Tổng Yêu Cầu Đã Xử Lý
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {data?.total ?? 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Hoàn Tiền Ví Tự Động
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              ✓ Hoạt động 100%
            </p>
          </div>
        </div>
      </div>

      {/* ── Queue Table Container ── */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Card Header with Embedded Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="mr-2 flex shrink-0 items-center gap-1 text-xs font-bold text-slate-400">
            <Filter className="h-3.5 w-3.5" /> Lọc trạng thái:
          </span>

          {[
            { key: "AWAITING_RETURN", label: "Chờ nhập kho (Ưu tiên)" },
            { key: "FAILED", label: "Xử lý lỗi" },
            { key: "REQUESTED", label: "Yêu cầu hủy" },
            { key: "RESTOCKED", label: "Đã nhập kho" },
            { key: "COMPLETED", label: "Hoàn tất" },
            { key: "ALL", label: "Tất cả đơn" },
          ].map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <Button
                key={tab.key}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStatus(tab.key as OrderCancellationStatus | "ALL");
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#2C3E35] text-white shadow-xs hover:bg-[#3A5246] hover:text-white"
                    : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-xs text-slate-500">
              <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2C3E35] border-t-transparent"></div>
              Đang tải danh sách hàng chờ kiểm kho...
            </div>
          ) : cancellations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-12 text-center text-xs text-slate-500">
              <PackageCheck className="h-10 w-10 text-slate-300" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Không có yêu cầu trả hàng nào ở trạng thái này
              </span>
              <p className="text-slate-400">
                Thử chọn tab lọc khác hoặc nhấn &quot;Làm mới&quot; để kiểm tra.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Mã Yêu Cầu
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Mã Đơn Hàng
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Trạng Thái
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Tiền Hoàn Ví
                    </th>
                    <th className="px-4 py-3 font-bold text-slate-700">
                      Yêu Cầu Trả Kho
                    </th>
                    <th className="px-4 py-3 text-right font-bold text-slate-700">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cancellations.map((item) => {
                    const badge = statusBadges[item.status] || {
                      label: item.status,
                      class: "bg-slate-100 text-slate-700",
                      desc: "",
                    };
                    const isAwaiting = item.status === "AWAITING_RETURN";

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                          isAwaiting
                            ? "bg-orange-50/30 dark:bg-orange-950/10"
                            : ""
                        }`}
                      >
                        <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                          #{item.id.slice(0, 8).toUpperCase()}
                        </td>

                        <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                          #{item.orderId.slice(0, 8).toUpperCase()}
                        </td>

                        <td className="p-4">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase ${badge.class}`}
                          >
                            {badge.label}
                          </span>
                          {item.lastError && (
                            <span className="mt-1 block max-w-[180px] truncate text-[10px] text-rose-600">
                              {item.lastError}
                            </span>
                          )}
                        </td>

                        <td className="p-4 font-extrabold text-[#2C3E35] dark:text-emerald-400">
                          {formatVnd(item.refundAmountVnd)}
                        </td>

                        <td className="p-4">
                          <span
                            className={`font-semibold ${
                              item.requiresStockReturn
                                ? "text-emerald-700 dark:text-emerald-400"
                                : "text-slate-400"
                            }`}
                          >
                            {item.requiresStockReturn ? "Có" : "Không"}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {item.items.length} mặt hàng
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDetailModalItem(item)}
                              className="h-8 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" />
                              Chi tiết
                            </Button>

                            {isAwaiting && (
                              <Button
                                size="sm"
                                onClick={() => setConfirmModalItem(item)}
                                className="h-8 rounded-xl bg-[#2C3E35] text-xs font-bold text-white shadow-xs hover:bg-[#3A5246]"
                              >
                                Kiểm kho ➔
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* Pagination */}
              <DataTablePagination
                page={page}
                totalPages={Math.max(
                  1,
                  Math.ceil((data?.total ?? cancellations.length) / 15),
                )}
                totalItems={data?.total ?? cancellations.length}
                pageSize={15}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ConfirmReturnModal
        cancellation={confirmModalItem}
        isOpen={Boolean(confirmModalItem)}
        onClose={() => setConfirmModalItem(null)}
      />

      <CancellationDetailModal
        cancellation={detailModalItem}
        isOpen={Boolean(detailModalItem)}
        onClose={() => setDetailModalItem(null)}
        isAdmin={isAdmin}
        onOpenConfirmReturn={() => {
          setConfirmModalItem(detailModalItem);
          setDetailModalItem(null);
        }}
      />
    </div>
  );
}
