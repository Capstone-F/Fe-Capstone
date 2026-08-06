"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCancelOrder } from "../hooks/useOrders";

interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const COMMON_REASONS = [
  "Muốn đổi địa chỉ giao hàng",
  "Muốn đổi phương thức thanh toán",
  "Đặt nhầm sản phẩm / số lượng",
  "Không muốn mua nữa",
];

export function CancelOrderDialog({
  isOpen,
  onClose,
  orderId,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const cancelMutation = useCancelOrder();

  const handleCancel = () => {
    const finalReason =
      reason.trim() || selectedReason || "Hủy đơn hàng theo yêu cầu khách hàng";
    cancelMutation.mutate(
      { id: orderId, reason: finalReason },
      {
        onSuccess: () => {
          toast.success("Đã hủy đơn hàng thành công");
          onClose();
        },
        onError: (err) => {
          const msg = (err as Error)?.message || "Không thể hủy đơn hàng";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            Hủy Đơn Hàng
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không
            thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <label className="text-xs font-semibold text-slate-700">
            Lý do hủy đơn hàng:
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSelectedReason(r);
                  setReason("");
                }}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedReason === r
                    ? "border-rose-500 bg-rose-50 text-rose-700"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Hoặc nhập lý do khác..."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setSelectedReason("");
            }}
            rows={3}
            className="mt-1 rounded-xl border-slate-200 text-xs focus-visible:ring-rose-500"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl text-xs"
          >
            Quay lại
          </Button>
          <Button
            type="button"
            disabled={cancelMutation.isPending}
            onClick={handleCancel}
            className="rounded-xl bg-rose-600 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
          >
            {cancelMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Xác Nhận Hủy Đơn"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
