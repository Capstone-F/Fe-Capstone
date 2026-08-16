"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  AlertTriangle,
  RotateCw,
  Wallet,
  Package,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { formatVnd } from "@/shared/utils/format";
import { useTickCancellationBatch } from "../hooks/useCancellations";
import type { OrderCancellation } from "../types/cancellation.types";
import { WalletInspectorModal } from "./wallet-inspector-modal";

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
  isAdmin = false,
}: CancellationDetailModalProps) {
  const tickMutation = useTickCancellationBatch();
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  if (!cancellation) return null;

  const statusInfo = statusLabels[cancellation.status] || {
    label: cancellation.status,
    class: "bg-slate-100 text-slate-700",
  };

  const handleTick = () => {
    tickMutation.mutate(undefined, {
      onSuccess: (res) => {
        toast.success(
          `Đã chạy batch tick thành công! Đã xử lý ${res.data.processed} đơn.`,
        );
      },
      onError: (err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ||
          (err as Error)?.message ||
          "Không thể kích hoạt cron tick";
        toast.error(msg);
      },
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl rounded-3xl p-4 shadow-2xl sm:p-6">
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
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>
                    Xử lý bị lỗi (Lần thử: {cancellation.attempts ?? 1})
                  </span>
                </div>
                <p className="mt-1 rounded-xl border border-rose-200/80 bg-white/60 p-2 font-mono text-[11px] leading-relaxed text-rose-800">
                  {cancellation.lastError || "Chưa có thông tin lỗi chi tiết."}
                </p>
              </div>
            )}

            {/* Refund Snapshot & Info Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Số tiền hoàn vào Ví GlowScan
                </span>
                <span className="text-xl font-extrabold text-[#2C3E35] dark:text-emerald-400">
                  {formatVnd(cancellation.refundAmountVnd)}
                </span>
                <span className="mt-1 text-[11px] text-slate-500">
                  Mã đơn hàng:{" "}
                  <strong className="font-mono text-slate-800 dark:text-slate-200">
                    #{cancellation.orderId.slice(0, 8).toUpperCase()}
                  </strong>
                </span>
              </div>

              <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Yêu cầu nhập lại kho
                </span>
                <span
                  className={`text-sm font-bold ${
                    cancellation.requiresStockReturn
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {cancellation.requiresStockReturn
                    ? "Có - Cần kiểm kê tại Bàn kiểm kho"
                    : "Không - Đơn chưa thanh toán / không trả kho"}
                </span>
                <span className="mt-1 text-[11px] text-slate-500">
                  Ngày tạo:{" "}
                  {new Date(cancellation.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            </div>

            {/* Items List */}
            <div className="flex flex-col gap-2.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Danh sách sản phẩm hoàn trả ({cancellation.items.length} món):
              </Label>

              <div className="flex max-h-[200px] flex-col gap-2 overflow-y-auto">
                {cancellation.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 flex-col gap-2 rounded-xl border border-slate-100 bg-white p-3 text-xs shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Package className="h-4 w-4 shrink-0 text-slate-400" />
                      <div className="min-w-0">
                        <span className="font-bold break-words text-slate-900 dark:text-white">
                          {item.productName ||
                            `Sản phẩm #${item.orderItemId.slice(0, 8)}`}
                        </span>
                        <div className="text-[11px] text-slate-500">
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

            {/* Admin Ops Controls Banner */}
            {isAdmin && (
              <div className="flex flex-col gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 text-xs dark:border-blue-900/50 dark:bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 dark:text-blue-200">
                    Công cụ Quản trị viên (Admin Operations & Dev Tools):
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setWalletModalOpen(true)}
                    className="h-7 rounded-xl border-blue-200 text-[11px] font-bold text-blue-900 hover:bg-blue-100"
                  >
                    <Wallet className="mr-1 h-3.5 w-3.5" />
                    Soi Ví khách hàng
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTick}
                    disabled={tickMutation.isPending}
                    className="rounded-xl border-blue-300 text-xs font-bold text-blue-900 hover:bg-blue-100"
                  >
                    {tickMutation.isPending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Kích hoạt Cron Tick Sweep
                  </Button>
                </div>
              </div>
            )}
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

      <WalletInspectorModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
      />
    </>
  );
}
