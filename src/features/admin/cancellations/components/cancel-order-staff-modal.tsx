"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { XCircle, Loader2 } from "lucide-react";
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
import { useCancelOrderStaff } from "../hooks/useCancellations";

interface CancelOrderStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

export function CancelOrderStaffModal({
  isOpen,
  onClose,
  orderId: initialOrderId = "",
}: CancelOrderStaffModalProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [prevInitialOrderId, setPrevInitialOrderId] = useState(initialOrderId);
  const [reason, setReason] = useState("");
  const cancelMutation = useCancelOrderStaff();

  if (initialOrderId !== prevInitialOrderId) {
    setPrevInitialOrderId(initialOrderId);
    setOrderId(initialOrderId);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast.error("Vui lòng nhập Mã đơn hàng (Order ID).");
      return;
    }

    cancelMutation.mutate(
      { orderId: orderId.trim(), reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Đã khởi tạo yêu cầu hủy đơn hàng thành công!");
          setOrderId("");
          setReason("");
          onClose();
        },
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
            (err as Error)?.message ||
            "Không thể hủy đơn hàng (Đơn có thể đã hủy hoặc không tồn tại)";
          toast.error(msg);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-3xl p-6 shadow-2xl">
        <DialogHeader className="space-y-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600">
            <XCircle className="h-5 w-5 text-rose-600" />
            Hủy đơn hàng (Nhân viên / Quản trị)
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Nhập mã đơn hàng để tạo yêu cầu hủy đơn và kích hoạt quy trình hoàn
            tiền ví & trả hàng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="orderId"
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Mã đơn hàng (Order ID):
            </Label>
            <Input
              id="orderId"
              placeholder="Nhập mã UUID đơn hàng..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="rounded-xl border-slate-200 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="reason"
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Lý do hủy đơn hàng:
            </Label>
            <Textarea
              id="reason"
              placeholder="Nhập lý do hủy đơn (VD: Hàng hỏng kho, hết hàng...)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
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
              disabled={cancelMutation.isPending}
              className="rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác Nhận Hủy Đơn"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
