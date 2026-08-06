"use client";

import { useState } from "react";
import { Activity, AlertCircle, Frown, Meh, Smile } from "lucide-react";
import { toast } from "sonner";
import { ApiError } from "@/core/api/errors";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { useCreateCheckIn } from "../hooks/useRoutineTracking";
import type { RoutinePeriod } from "../types/routine-tracking.types";

export type OverallFeeling = "BETTER" | "SAME" | "WORSE";
export type SymptomKey =
  | "oiliness"
  | "dryness"
  | "redness"
  | "acne"
  | "itching"
  | "burning"
  | "peeling"
  | "new_breakout";

const FEELINGS: {
  key: OverallFeeling;
  label: string;
  icon: typeof Smile;
  color: string;
}[] = [
  {
    key: "BETTER",
    label: "Tốt hơn",
    icon: Smile,
    color: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    key: "SAME",
    label: "Như cũ",
    icon: Meh,
    color: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    key: "WORSE",
    label: "Kém hơn",
    icon: Frown,
    color: "border-rose-500 bg-rose-50 text-rose-700",
  },
];

const SYMPTOMS: { key: SymptomKey; label: string }[] = [
  { key: "oiliness", label: "Dầu" },
  { key: "dryness", label: "Khô" },
  { key: "redness", label: "Đỏ" },
  { key: "acne", label: "Mụn" },
  { key: "itching", label: "Ngứa" },
  { key: "burning", label: "Châm chích" },
  { key: "peeling", label: "Bong da" },
  { key: "new_breakout", label: "Mụn mới" },
];

interface DailyCheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routineId: string;
  period: RoutinePeriod;
}

export function DailyCheckInDialog({
  open,
  onOpenChange,
  routineId,
  period,
}: DailyCheckInDialogProps) {
  const [feeling, setFeeling] = useState<OverallFeeling>("SAME");
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomKey[]>([]);
  const [note, setNote] = useState("");

  const createCheckIn = useCreateCheckIn(routineId);

  const toggleSymptom = (key: SymptomKey) => {
    setSelectedSymptoms((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Map to exact Backend DTO as Mobile mo_capstone mappers.ts
    const moodMap: Record<OverallFeeling, "GOOD" | "OK" | "BAD"> = {
      BETTER: "GOOD",
      SAME: "OK",
      WORSE: "BAD",
    };

    const sideEffects: {
      type: "ITCHING" | "BURNING" | "PEELING" | "BREAKOUT" | "REDNESS";
      severity?: number;
    }[] = [];
    if (selectedSymptoms.includes("itching"))
      sideEffects.push({ type: "ITCHING", severity: 3 });
    if (selectedSymptoms.includes("burning"))
      sideEffects.push({ type: "BURNING", severity: 3 });
    if (selectedSymptoms.includes("peeling"))
      sideEffects.push({ type: "PEELING", severity: 3 });
    if (selectedSymptoms.includes("new_breakout"))
      sideEffects.push({ type: "BREAKOUT", severity: 3 });
    if (selectedSymptoms.includes("redness"))
      sideEffects.push({ type: "REDNESS", severity: 3 });

    createCheckIn.mutate(
      {
        period,
        overallMood: moodMap[feeling],
        acneLevel: selectedSymptoms.includes("acne") ? 3 : 0,
        oilLevel: selectedSymptoms.includes("oiliness") ? 3 : 0,
        rednessLevel: selectedSymptoms.includes("redness") ? 3 : 0,
        moistureLevel: selectedSymptoms.includes("dryness") ? 1 : 4,
        note: note.trim() ? note.trim() : undefined,
        sideEffects: sideEffects.length > 0 ? sideEffects : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã ghi nhận nhật ký da hôm nay!");
          onOpenChange(false);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            toast.error("Bạn đã check-in cho khung giờ này hôm nay rồi.");
            return;
          }
          toast.error(
            error instanceof ApiError
              ? error.message
              : "Không thể gửi check-in. Vui lòng thử lại.",
          );
        },
      },
    );
  };

  const hasDangerousSymptom =
    selectedSymptoms.includes("burning") ||
    selectedSymptoms.includes("itching");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Activity className="h-5 w-5 text-[#6b5cf6]" />
            Check-in Tình Trạng Da Hàng Ngày
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Cảm nhận chung */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Cảm giác chung trên da hôm nay
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FEELINGS.map((item) => {
                const Icon = item.icon;
                const active = feeling === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFeeling(item.key)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3.5 transition-all ${
                      active
                        ? item.color
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tình trạng da */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Tình trạng da ghi nhận
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((symptom) => {
                const active = selectedSymptoms.includes(symptom.key);
                return (
                  <button
                    key={symptom.key}
                    type="button"
                    onClick={() => toggleSymptom(symptom.key)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "border-[#6b5cf6] bg-[#6b5cf6] text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {symptom.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dangerous symptom warning prompt */}
          {hasDangerousSymptom && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div>
                <span className="font-bold">Lưu ý kích ứng:</span> Phát hiện
                biểu hiện châm chích/ngứa. Bạn có thể sử dụng nút{" "}
                <strong>&quot;Báo Tác Dụng Phụ&quot;</strong> để chuyển thông
                tin tới Bác sĩ điều trị.
              </div>
            </div>
          )}

          {/* Ghi chú thêm */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Ghi chú thêm về da
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: Vùng má hơi đỏ nhẹ sau khi rửa mặt..."
              className="h-20 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
              disabled={createCheckIn.isPending}
              className="bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
            >
              {createCheckIn.isPending ? "Đang lưu..." : "Lưu Check-in"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
