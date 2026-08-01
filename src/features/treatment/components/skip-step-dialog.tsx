"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  SKIP_REASON_LABELS,
  SKIP_REASON_OPTIONS,
} from "../constants/routine-tracking";
import type {
  SkipReason,
  SkipStepPayload,
} from "../types/routine-tracking.types";

interface SkipStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepName: string;
  isPending: boolean;
  onSubmit: (payload: SkipStepPayload) => void;
}

export function SkipStepDialog({
  open,
  onOpenChange,
  stepName,
  isPending,
  onSubmit,
}: SkipStepDialogProps) {
  const [reason, setReason] = useState<SkipReason>("FORGOT");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Mirrors the backend rule: note is mandatory when reason is OTHER.
    if (reason === "OTHER" && !note.trim()) {
      setError('Vui lòng mô tả lý do khi chọn "Lý do khác".');
      return;
    }
    setError(null);
    onSubmit({ reason, note: note.trim() ? note.trim() : undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Bỏ qua bước: {stepName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Lý do bỏ qua
            </label>
            <div className="flex flex-col gap-2">
              {SKIP_REASON_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReason(option)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all ${
                    reason === option
                      ? "border-[#6b5cf6] bg-[#6b5cf6]/5 text-[#6b5cf6]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {SKIP_REASON_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Ghi chú {reason === "OTHER" ? "(bắt buộc)" : "(không bắt buộc)"}
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: sản phẩm vừa hết, đang chờ giao..."
              className="h-20 text-xs"
            />
            {error && <p className="text-[11px] text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
            >
              Xác nhận bỏ qua
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
