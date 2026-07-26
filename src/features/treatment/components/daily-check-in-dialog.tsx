"use client";

import { useState } from "react";
import { Activity, Frown, Meh, Smile } from "lucide-react";
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
import {
  MOOD_LABELS,
  MOOD_OPTIONS,
  SIDE_EFFECT_LABELS,
  SIDE_EFFECT_OPTIONS,
} from "../constants/routine-tracking";
import { useCreateCheckIn } from "../hooks/useRoutineTracking";
import type {
  CheckInMood,
  RoutinePeriod,
  SideEffectType,
} from "../types/routine-tracking.types";

const MOOD_ICONS: Record<CheckInMood, typeof Smile> = {
  GOOD: Smile,
  OK: Meh,
  BAD: Frown,
};

const MOOD_ACTIVE_CLASS: Record<CheckInMood, string> = {
  GOOD: "border-emerald-500 bg-emerald-50 text-emerald-700",
  OK: "border-amber-500 bg-amber-50 text-amber-700",
  BAD: "border-red-500 bg-red-50 text-red-700",
};

const LEVEL_FIELDS = [
  { key: "acneLevel", label: "Mụn" },
  { key: "oilLevel", label: "Dầu" },
  { key: "rednessLevel", label: "Mẩn đỏ" },
  { key: "moistureLevel", label: "Độ ẩm" },
] as const;

type LevelKey = (typeof LEVEL_FIELDS)[number]["key"];

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
  const [mood, setMood] = useState<CheckInMood>("OK");
  const [levels, setLevels] = useState<Record<LevelKey, number>>({
    acneLevel: 0,
    oilLevel: 0,
    rednessLevel: 0,
    moistureLevel: 3,
  });
  const [sideEffects, setSideEffects] = useState<SideEffectType[]>([]);
  const [note, setNote] = useState("");

  const createCheckIn = useCreateCheckIn(routineId);

  const toggleSideEffect = (type: SideEffectType) => {
    setSideEffects((previous) =>
      previous.includes(type)
        ? previous.filter((item) => item !== type)
        : [...previous, type],
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    createCheckIn.mutate(
      {
        period,
        overallMood: mood,
        acneLevel: levels.acneLevel,
        oilLevel: levels.oilLevel,
        rednessLevel: levels.rednessLevel,
        moistureLevel: levels.moistureLevel,
        note: note.trim() ? note.trim() : undefined,
        // Severity is not collected in this MVP form; the backend accepts it as optional.
        sideEffects: sideEffects.map((type) => ({ type })),
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
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Cảm giác chung trên da hôm nay
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((option) => {
                const Icon = MOOD_ICONS[option];
                const active = mood === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setMood(option)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      active ? MOOD_ACTIVE_CLASS[option] : "border-slate-200"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-[10px] font-bold">
                      {MOOD_LABELS[option]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Mức độ hiện tại (0 - 5)
            </label>
            <div className="space-y-2">
              {LEVEL_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-2">
                  <span className="w-16 text-xs text-slate-600">
                    {field.label}
                  </span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setLevels((previous) => ({
                            ...previous,
                            [field.key]: value,
                          }))
                        }
                        className={`h-7 w-7 rounded-lg border text-[11px] font-bold transition-all ${
                          levels[field.key] === value
                            ? "border-[#6b5cf6] bg-[#6b5cf6] text-white"
                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Tác dụng phụ gặp phải (nếu có)
            </label>
            <div className="flex flex-wrap gap-2">
              {SIDE_EFFECT_OPTIONS.map((type) => {
                const active = sideEffects.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleSideEffect(type)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                      active
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {SIDE_EFFECT_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Ghi chú thêm về da
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: Vùng má còn hơi đỏ sau khi rửa mặt..."
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
              Lưu Check-in
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
