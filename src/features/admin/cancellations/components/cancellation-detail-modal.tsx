"use client";

import React from "react";
import { FileText, AlertTriangle, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";
import type { OrderCancellation } from "../types/cancellation.types";

interface CancellationDetailModalProps {
  cancellation: OrderCancellation | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenConfirmReturn?: () => void;
  isAdmin?: boolean;
}

const statusLabels: Record<string, { label: string; class: string }> = {
  REQUESTED: { label: "Yêu cầu hủy đơn", class: "bg-blue-100 text-blue-800" },
  REFUNDING: {
    label: "Đang hoàn tiền ví",
    class: "bg-amber-100 text-amber-800",
  },
  REFUNDED: {
    label: "Đã hoàn tiền ví",
    class: "bg-purple-100 text-purple-800",
  },
  AWAITING_RETURN: {
    label: "Chờ nhập kho",
    class:
      "bg-orange-100 text-orange-900 border border-orange-300 font-extrabold",
  },
  RESTOCKED: { label: "Đã nhập kho", class: "bg-emerald-100 text-emerald-800" },
  COMPLETED: { label: "Hoàn tất", class: "bg-emerald-600 text-white" },
  FAILED: { label: "Xử lý lỗi", class: "bg-rose-100 text-rose-800 font-bold" },
};

export function CancellationDetailModal({
  cancellation,
  isOpen,
  onClose,
  onOpenConfirmReturn,
}: CancellationDetailModalProps) {
  if (!cancellation) return null;

  const statusInfo = statusLabels[cancellation.status] || {
    label: cancellation.status,
    class: "bg-slate-100 text-slate-700",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto rounded-3xl p-4 shadow-2xl sm:max-w-2xl sm:p-6">
        <DialogHeader className="space-y-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex min-w-0 flex-wrap items-start justify-between gap-2 pr-8">
            <DialogTitle className="flex min-w-0 items-start gap-2 text-xl font-bold break-words text-[#2C3E35] dark:text-emerald-400">
              <FileText className="h-6 w-6 text-[#2C3E35] dark:text-emerald-400" />
              Chi tiết Yêu cầu Hủy đơn & Hoàn kho
            </DialogTitle>
            <span
              className={`rounded-full px-3 py-1 text-xs uppercase ${statusInfo.class}`}
            >
              {statusInfo.label}
            </span>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Mã yêu cầu:{" "}
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              #{cancellation.id}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          {/* Error Banner if FAILED */}
          {cancellation.status === "FAILED" && (
            <div className="flex flex-col gap-1 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <AlertTriangle className="h-4 w-4" />
                Lý do lỗi hệ thống (Failed Reason):
              </div>
              <p className="font-mono font-semibold">
                {cancellation.lastError || "Lỗi không xác định"}
              </p>
            </div>
          )}

          {/* Refund & Restock Grid Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Số tiền hoàn vào ví GlowScan
              </span>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {formatVnd(cancellation.refundAmountVnd)}
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Mã đơn hàng:{" "}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  #{cancellation.orderId.slice(0, 8)}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Yêu cầu nhập lại kho
              </span>
              <div className="my-2">
                {cancellation.requiresStockReturn ? (
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    Có - Cần kiểm kê tại Bàn kiểm kho
                  </span>
                ) : (
                  <span className="text-sm font-bold text-slate-500">
                    Không cần trả hàng
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                Ngày tạo:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {new Date(cancellation.createdAt).toLocaleTimeString("vi-VN")}{" "}
                  {new Date(cancellation.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          {/* Items Return Table */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Danh sách sản phẩm hoàn trả ({cancellation.items.length} món):
            </span>

            <div className="flex flex-col gap-2">
              {cancellation.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3 text-xs shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
                      <Package className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {item.productName ||
                          `Sản phẩm #${item.orderItemId.slice(0, 8)}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Mã dòng đơn: {item.orderItemId.slice(0, 8)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Cần trả: {item.expectedQuantity} SP
                      </span>
                      {item.goodQuantity !== null &&
                        item.goodQuantity !== undefined && (
                          <span className="text-[10px] font-semibold text-emerald-700">
                            Tốt: {item.goodQuantity} | Hỏng:{" "}
                            {item.damagedQuantity || 0}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {cancellation.status === "AWAITING_RETURN" && onOpenConfirmReturn && (
          <DialogFooter className="gap-2 border-t border-slate-100 pt-2 sm:gap-0 dark:border-slate-800">
            <Button
              type="button"
              onClick={() => {
                onClose();
                onOpenConfirmReturn();
              }}
              className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white shadow-md hover:bg-[#3A5246]"
            >
              Mở Bàn Kiểm Kho Trả Hàng ➔
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
