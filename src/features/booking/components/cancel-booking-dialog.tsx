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
import { useCancelBooking } from "../hooks/useBooking";

interface CancelBookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

const COMMON_REASONS = [
  "Bận việc đột xuất",
  "Muốn đổi lịch tư vấn sang thời gian khác",
  "Sức khỏe đã ổn định",
  "Đặt nhầm dịch vụ / Bác sĩ",
];

export function CancelBookingDialog({
  isOpen,
  onClose,
  bookingId,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const cancelMutation = useCancelBooking();

  const handleCancel = () => {
    const finalReason =
      reason.trim() || selectedReason || "Hủy lịch hẹn theo yêu cầu người dùng";
    cancelMutation.mutate(
      { id: bookingId, reason: finalReason },
      {
        onSuccess: () => {
          toast.success("Đã hủy lịch hẹn tư vấn thành công");
          onClose();
        },
        onError: (err) => {
          const msg = (err as Error)?.message || "Không thể hủy lịch hẹn";
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
            Hủy Lịch Hẹn Tư Vấn
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Bạn có chắc chắn muốn hủy cuộc hẹn tư vấn này? Hệ thống sẽ cập nhật
            trạng thái hủy cuộc hẹn.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <label className="text-xs font-semibold text-slate-700">
            Lý do hủy cuộc hẹn:
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
              "Xác Nhận Hủy Lịch"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
