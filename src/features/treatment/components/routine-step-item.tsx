"use client";

import { CheckCircle2, SkipForward } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { SKIP_REASON_LABELS } from "../constants/routine-tracking";
import type { TodayStep } from "../types/routine-tracking.types";
import { StepStockBadge } from "./step-stock-badge";

interface RoutineStepItemProps {
  step: TodayStep;
  index: number;
  isPending: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function RoutineStepItem({
  step,
  index,
  isPending,
  onComplete,
  onSkip,
}: RoutineStepItemProps) {
  const { isCompleted: isDone, isSkipped, isActed, dosageLabel } = step;

  return (
    <Card
      className={`border-slate-200 shadow-xs transition-all ${
        isActed
          ? "border-slate-200 bg-slate-50/80"
          : "bg-white hover:border-[#6b5cf6]/40"
      }`}
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E2EBE6] text-xs font-bold text-[#2C3E35]">
            {index + 1}
          </span>
          <div className="space-y-1">
            <h3
              className={`text-sm font-bold ${
                isActed ? "text-slate-500 line-through" : "text-slate-900"
              }`}
            >
              {step.name}
            </h3>
            {step.productVariant && (
              <p className="text-xs font-semibold text-[#6b5cf6]">
                {step.productVariant.name}
              </p>
            )}
            {step.instructions && (
              <p className="text-xs leading-relaxed text-slate-600">
                {step.instructions}
              </p>
            )}
            <div className="flex flex-wrap gap-2 pt-1.5">
              <StepStockBadge
                warning={step.warning}
                remainingMl={step.remainingMl}
              />
              {dosageLabel && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  Lượng dùng: {dosageLabel}
                </span>
              )}
              {step.waitMinutes !== null && step.waitMinutes > 0 && (
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  Chờ {step.waitMinutes} phút
                </span>
              )}
              {isSkipped && step.skipReason && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Đã bỏ qua: {SKIP_REASON_LABELS[step.skipReason]}
                </span>
              )}
            </div>
            {isSkipped && step.skipNote && (
              <p className="text-[10px] text-slate-500 italic">
                &quot;{step.skipNote}&quot;
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Button
            size="sm"
            variant={isDone ? "outline" : "default"}
            disabled={isPending || isActed}
            onClick={onComplete}
            className={`rounded-xl text-xs font-bold ${
              isDone
                ? "border-emerald-300 text-emerald-700"
                : "bg-[#2C3E35] text-white hover:bg-[#3A5246]"
            }`}
          >
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            {isDone ? "Đã xong" : "Hoàn thành"}
          </Button>
          {!isActed && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={onSkip}
              className="rounded-xl text-xs font-semibold text-slate-500"
            >
              <SkipForward className="mr-1.5 h-3.5 w-3.5" />
              Bỏ qua
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
