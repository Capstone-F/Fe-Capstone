"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  DAY_STATUS_LABELS,
  MOOD_LABELS,
  PERIOD_LABELS,
  SIDE_EFFECT_LABELS,
  SKIP_REASON_LABELS,
} from "../constants/routine-tracking";
import { useHistoryDay } from "../hooks/useRoutineTracking";
import type { RoutinePeriod } from "../types/routine-tracking.types";

const PERIODS: RoutinePeriod[] = ["MORNING", "EVENING"];

interface HistoryDayDialogProps {
  routineId: string;
  /** null closes the dialog. */
  date: string | null;
  onClose: () => void;
}

export function HistoryDayDialog({
  routineId,
  date,
  onClose,
}: HistoryDayDialogProps) {
  const [period, setPeriod] = useState<RoutinePeriod>("MORNING");
  // useHistoryDay expects `string | undefined`; the dialog's own prop uses
  // `null` to signal "closed", so coerce at the call site.
  const { data, isLoading } = useHistoryDay(
    routineId,
    date ?? undefined,
    period,
  );

  if (!date) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Chi tiết ngày {date}
          </DialogTitle>
        </DialogHeader>

        <div className="flex rounded-xl bg-slate-100 p-1">
          {PERIODS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPeriod(option)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                period === option
                  ? "bg-white text-[#6b5cf6] shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {PERIOD_LABELS[option]}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {data && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>{DAY_STATUS_LABELS[data.status]}</span>
              <span>
                {data.progress.completedCount}/{data.progress.totalCount} bước ·{" "}
                {data.progress.completionRate}%
              </span>
            </div>

            {data.steps.length === 0 ? (
              <p className="py-2 text-center text-xs text-slate-500">
                Không có bước nào cho khung giờ này.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {data.steps.map((step) => (
                  <li
                    key={step.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-slate-700">
                      {step.name}
                    </span>
                    <span
                      className={
                        step.status === "COMPLETED"
                          ? "font-bold text-emerald-600"
                          : step.status === "SKIPPED"
                            ? "font-bold text-amber-600"
                            : "text-slate-400"
                      }
                    >
                      {step.status === "COMPLETED"
                        ? "Hoàn thành"
                        : step.status === "SKIPPED"
                          ? `Bỏ qua${step.skipReason ? ` · ${SKIP_REASON_LABELS[step.skipReason]}` : ""}`
                          : "Chưa làm"}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {data.checkIn ? (
              <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <div className="font-bold text-slate-700">
                  Check-in:{" "}
                  {data.checkIn.overallMood
                    ? MOOD_LABELS[data.checkIn.overallMood]
                    : "Chưa đánh giá"}
                </div>
                {data.checkIn.sideEffects.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {data.checkIn.sideEffects.map((sideEffect) => (
                      <span
                        key={sideEffect.id}
                        className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700"
                      >
                        {SIDE_EFFECT_LABELS[sideEffect.type]}
                      </span>
                    ))}
                  </div>
                )}
                {data.checkIn.note && (
                  <p className="text-slate-600 italic">
                    &quot;{data.checkIn.note}&quot;
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-xs text-slate-400">
                Không có check-in cho khung giờ này.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
