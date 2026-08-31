"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useUpdateExpertCancellationPolicy } from "@/features/cancellation-reports/hooks/useExpertCancellationReports";
import { isNoShowWeightValid } from "../utils/cancellation-policy-validation";

const CROSS_FIELD_MESSAGE =
  "Trọng số no-show không được vượt quá ngưỡng điểm vi phạm.";

function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

interface LimitAndWeightFieldsProps {
  cancelLimit: number;
  noShowWeight: number;
}

export function LimitAndWeightFields({
  cancelLimit,
  noShowWeight,
}: LimitAndWeightFieldsProps) {
  const [cancelLimitInput, setCancelLimitInput] = useState(String(cancelLimit));
  const [noShowWeightInput, setNoShowWeightInput] = useState(
    String(noShowWeight),
  );
  const [cancelLimitError, setCancelLimitError] = useState<string | null>(null);
  const [noShowWeightError, setNoShowWeightError] = useState<string | null>(
    null,
  );
  const updatePolicy = useUpdateExpertCancellationPolicy();

  const effectiveCancelLimit = Number(cancelLimitInput) || 0;
  const effectiveNoShowWeight = Number(noShowWeightInput) || 0;
  const crossFieldValid = isNoShowWeightValid(
    effectiveCancelLimit,
    effectiveNoShowWeight,
  );

  async function handleSubmit(
    event: React.FormEvent,
    field: "cancelLimit" | "noShowWeight",
  ) {
    event.preventDefault();
    const isCancelLimit = field === "cancelLimit";
    const input = isCancelLimit ? cancelLimitInput : noShowWeightInput;
    const setError = isCancelLimit ? setCancelLimitError : setNoShowWeightError;
    const [min, max] = isCancelLimit ? [1, 100] : [1, 10];

    if (!/^\d+$/.test(input)) {
      setError("Giá trị phải là số nguyên không âm.");
      return;
    }

    const value = Number(input);
    if (value < min || value > max) {
      setError(`Giá trị phải nằm trong khoảng ${min}–${max}.`);
      return;
    }

    if (!crossFieldValid) {
      setError(CROSS_FIELD_MESSAGE);
      return;
    }

    setError(null);
    try {
      await updatePolicy.mutateAsync({ [field]: value });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể cập nhật.");
    }
  }

  return (
    <>
      <form
        onSubmit={(event) => void handleSubmit(event, "cancelLimit")}
        className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <Label htmlFor="cancelLimit" className="text-xs font-bold">
          Ngưỡng điểm vi phạm
        </Label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Expert đạt số điểm này trong cửa sổ trượt sẽ bị gắn cờ.
        </p>
        <div className="relative mt-1">
          <Input
            id="cancelLimit"
            inputMode="numeric"
            value={cancelLimitInput}
            aria-invalid={Boolean(cancelLimitError) || !crossFieldValid}
            onKeyDown={(event) => {
              if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
                event.preventDefault();
              }
            }}
            onChange={(event) => {
              setCancelLimitInput(digitsOnly(event.target.value));
              setCancelLimitError(null);
            }}
            className="rounded-xl pr-14 font-mono"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-500">
            điểm
          </span>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={
            updatePolicy.isPending ||
            cancelLimitInput === String(cancelLimit) ||
            !crossFieldValid
          }
          className="w-full rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
        >
          {updatePolicy.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Lưu"
          )}
        </Button>
        {cancelLimitError && (
          <p className="text-xs font-medium text-red-600">{cancelLimitError}</p>
        )}
      </form>

      <form
        onSubmit={(event) => void handleSubmit(event, "noShowWeight")}
        className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <Label htmlFor="noShowWeight" className="text-xs font-bold">
          Trọng số no-show / hủy sát giờ
        </Label>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Điểm nhân thêm cho mỗi lần no-show hoặc hủy sát giờ (hủy thường luôn
          tính 1 điểm).
        </p>
        <div className="relative mt-1">
          <Input
            id="noShowWeight"
            inputMode="numeric"
            value={noShowWeightInput}
            aria-invalid={Boolean(noShowWeightError) || !crossFieldValid}
            onKeyDown={(event) => {
              if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
                event.preventDefault();
              }
            }}
            onChange={(event) => {
              setNoShowWeightInput(digitsOnly(event.target.value));
              setNoShowWeightError(null);
            }}
            className="rounded-xl pr-14 font-mono"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-500">
            lần
          </span>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={
            updatePolicy.isPending ||
            noShowWeightInput === String(noShowWeight) ||
            !crossFieldValid
          }
          className="w-full rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
        >
          {updatePolicy.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Lưu"
          )}
        </Button>
        {noShowWeightError ? (
          <p className="text-xs font-medium text-red-600">
            {noShowWeightError}
          </p>
        ) : (
          !crossFieldValid && (
            <p className="text-xs font-medium text-red-600">
              {CROSS_FIELD_MESSAGE}
            </p>
          )
        )}
      </form>
    </>
  );
}
