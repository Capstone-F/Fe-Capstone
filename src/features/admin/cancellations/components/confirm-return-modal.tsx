"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { PackageCheck, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { useConfirmReturn } from "../hooks/useCancellations";
import type {
  OrderCancellation,
  ConfirmReturnItemInput,
} from "../types/cancellation.types";

interface ConfirmReturnModalProps {
  cancellation: OrderCancellation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmReturnModal({
  cancellation,
  isOpen,
  onClose,
}: ConfirmReturnModalProps) {
  const confirmMutation = useConfirmReturn();
  const [itemsInput, setItemsInput] = useState<
    Record<string, { good: number; damaged: number }>
  >({});
  const [note, setNote] = useState("");

  const cancellationId = cancellation?.id;

  useEffect(() => {
    if (!cancellationId || !cancellation) return;
    const initial: Record<string, { good: number; damaged: number }> = {};
    cancellation.items.forEach((item) => {
      initial[item.orderItemId] = {
        good: item.goodQuantity ?? item.expectedQuantity,
        damaged: item.damagedQuantity ?? 0,
      };
    });
    queueMicrotask(() => {
      setItemsInput(initial);
      setNote("");
    });
  }, [cancellationId, cancellation]);

  if (!cancellation) return null;

  const isAwaitingReturn = cancellation.status === "AWAITING_RETURN";

  // Check if every line item has valid total quantity (good + damaged === expectedQuantity)
  const isValidSums = cancellation.items.every((item) => {
    const input = itemsInput[item.orderItemId] || { good: 0, damaged: 0 };
    return input.good + input.damaged === item.expectedQuantity;
  });

  const handleQuantityChange = (
    orderItemId: string,
    field: "good" | "damaged",
    val: number,
  ) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    setItemsInput((prev) => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        [field]: safeVal,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAwaitingReturn) {
      toast.error(
        "Chỉ có thể nhập kho khi đơn hàng đang ở trạng thái 'Chờ nhập kho' (AWAITING_RETURN).",
      );
      return;
    }

    if (!isValidSums) {
      toast.error(
        "Tổng (Hàng tốt + Hàng hỏng) phải bằng số lượng cần trả cho tất cả các dòng sản phẩm.",
      );
      return;
    }

    const payloadItems: ConfirmReturnItemInput[] = cancellation.items.map(
      (item) => ({
        orderItemId: item.orderItemId,
        goodQuantity: itemsInput[item.orderItemId]?.good ?? 0,
        damagedQuantity: itemsInput[item.orderItemId]?.damaged ?? 0,
      }),
    );

    confirmMutation.mutate(
      {
        id: cancellation.id,
        body: { items: payloadItems, note: note.trim() || undefined },
      },
      {
        onSuccess: () => {
          toast.success("Đã xác nhận nhập kho thành công!");
          onClose();
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
            (err as Error)?.message ||
            "Không thể xác nhận nhập kho";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#2C3E35] dark:text-emerald-400">
            <PackageCheck className="h-6 w-6 text-[#2C3E35] dark:text-emerald-400" />
            Kiểm kê & Xác nhận nhập kho hàng trả
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Mã yêu cầu:{" "}
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              #{cancellation.id.slice(0, 8).toUpperCase()}
            </span>{" "}
            • Đơn hàng:{" "}
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              #{cancellation.orderId.slice(0, 8).toUpperCase()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
          {!isAwaitingReturn && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Đơn hàng hiện không ở trạng thái &quot;Chờ nhập kho&quot;. Chức
                năng xác nhận nhập kho bị khóa.
              </span>
            </div>
          )}

          {/* Line items checklist */}
          <div className="flex flex-col gap-4">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Danh sách sản phẩm hoàn trả ({cancellation.items.length} mặt
              hàng):
            </Label>

            <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1">
              {cancellation.items.map((item) => {
                const current = itemsInput[item.orderItemId] || {
                  good: 0,
                  damaged: 0,
                };
                const sum = current.good + current.damaged;
                const isMatched = sum === item.expectedQuantity;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-3 rounded-2xl border p-4 text-xs transition-all ${
                      isMatched
                        ? "border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/50"
                        : "border-rose-200 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {item.productName ||
                            `Mặt hàng #${item.orderItemId.slice(0, 8)}`}
                        </span>
                        <span className="ml-2 rounded-full bg-[#E2EBE6] px-2 py-0.5 text-[10px] font-bold text-[#2C3E35]">
                          Cần trả: {item.expectedQuantity} SP
                        </span>
                      </div>
                      {isMatched ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Khớp số lượng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          Tổng = {sum} / {item.expectedQuantity}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      {/* Good Quantity Input */}
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400">
                          Hàng tốt (Bán tiếp):
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={item.expectedQuantity}
                          disabled={!isAwaitingReturn}
                          value={current.good}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.orderItemId,
                              "good",
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="h-9 rounded-xl border-slate-200 text-xs font-bold focus-visible:ring-emerald-600"
                        />
                      </div>

                      {/* Damaged Quantity Input */}
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] font-semibold text-rose-800 dark:text-rose-400">
                          Hàng hỏng (Kho lỗi):
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={item.expectedQuantity}
                          disabled={!isAwaitingReturn}
                          value={current.damaged}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.orderItemId,
                              "damaged",
                              parseInt(e.target.value, 10),
                            )
                          }
                          className="h-9 rounded-xl border-slate-200 text-xs font-bold focus-visible:ring-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="note"
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Ghi chú nhập kho (Tùy chọn):
            </Label>
            <Textarea
              id="note"
              disabled={!isAwaitingReturn}
              placeholder="Nhập ghi chú kiểm kê tình trạng hàng hóa..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="rounded-xl border-slate-200 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 pt-2 sm:gap-0 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs font-semibold"
            >
              Quay lại
            </Button>
            <Button
              type="submit"
              disabled={
                !isAwaitingReturn || !isValidSums || confirmMutation.isPending
              }
              className="rounded-xl bg-[#2C3E35] px-6 text-xs font-bold text-white shadow-md hover:bg-[#3A5246] disabled:opacity-50"
            >
              {confirmMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác Nhận Nhập Kho"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
