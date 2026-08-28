"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  useExpertCancellationPolicy,
  useUpdateExpertCancellationPolicy,
} from "@/features/cancellation-reports/hooks/useExpertCancellationReports";
import type { ExpertCancellationPolicyDto } from "@/features/cancellation-reports/types/expert-cancellation-report.types";

interface PolicyFieldConfig {
  key: keyof ExpertCancellationPolicyDto;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
}

const FIELDS: PolicyFieldConfig[] = [
  {
    key: "cancelLimit",
    label: "Ngưỡng điểm vi phạm",
    description: "Expert đạt số điểm này trong cửa sổ trượt sẽ bị gắn cờ.",
    unit: "điểm",
    min: 1,
    max: 100,
  },
  {
    key: "windowDays",
    label: "Cửa sổ trượt",
    description: "Số ngày report nhìn lại để tính điểm vi phạm.",
    unit: "ngày",
    min: 1,
    max: 365,
  },
  {
    key: "noShowWeight",
    label: "Trọng số no-show / hủy sát giờ",
    description:
      "Điểm nhân thêm cho mỗi lần no-show hoặc hủy sát giờ (hủy thường luôn tính 1 điểm).",
    unit: "lần",
    min: 1,
    max: 10,
  },
];

const LATE_CANCEL_PRESETS = [
  { label: "2 giờ", minutes: 120 },
  { label: "12 giờ", minutes: 720 },
  { label: "24 giờ", minutes: 1440 },
  { label: "48 giờ", minutes: 2880 },
];

function PolicyField({
  field,
  currentValue,
}: {
  field: PolicyFieldConfig;
  currentValue: number;
}) {
  const [input, setInput] = useState(String(currentValue));
  const [validationError, setValidationError] = useState<string | null>(null);
  const updatePolicy = useUpdateExpertCancellationPolicy();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(input)) {
      setValidationError("Giá trị phải là số nguyên không âm.");
      return;
    }

    const value = Number(input);
    if (value < field.min || value > field.max) {
      setValidationError(
        `Giá trị phải nằm trong khoảng ${field.min}–${field.max}.`,
      );
      return;
    }

    setValidationError(null);
    try {
      await updatePolicy.mutateAsync({ [field.key]: value });
    } catch {
      // toast already shown by the mutation's onError handler
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <Label htmlFor={field.key} className="text-xs font-bold">
        {field.label}
      </Label>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {field.description}
      </p>
      <div className="relative mt-1">
        <Input
          id={field.key}
          inputMode="numeric"
          value={input}
          aria-invalid={Boolean(validationError)}
          onKeyDown={(event) => {
            if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
              event.preventDefault();
            }
          }}
          onChange={(event) => {
            setInput(event.target.value.replace(/[^0-9]/g, ""));
            setValidationError(null);
          }}
          className="rounded-xl pr-14 font-mono"
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-500">
          {field.unit}
        </span>
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={updatePolicy.isPending || input === String(currentValue)}
        className="w-full rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
      >
        {updatePolicy.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Lưu"
        )}
      </Button>
      {validationError && (
        <p className="text-xs font-medium text-red-600">{validationError}</p>
      )}
    </form>
  );
}

function LateCancelThresholdField({ currentValue }: { currentValue: number }) {
  const [input, setInput] = useState(String(currentValue));
  const [validationError, setValidationError] = useState<string | null>(null);
  const updatePolicy = useUpdateExpertCancellationPolicy();

  async function submitValue(value: number) {
    if (value < 0 || value > 10080) {
      setValidationError("Giá trị phải nằm trong khoảng 0–10080.");
      return;
    }
    setValidationError(null);
    try {
      await updatePolicy.mutateAsync({ lateCancelThresholdMin: value });
    } catch {
      // toast already shown by the mutation's onError handler
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(input)) {
      setValidationError("Giá trị phải là số nguyên không âm.");
      return;
    }
    await submitValue(Number(input));
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <Label htmlFor="lateCancelThresholdMin" className="text-xs font-bold">
        Ngưỡng hủy sát giờ
      </Label>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Hủy trong vòng khoảng thời gian này trước giờ hẹn được tính là &quot;hủy
        sát giờ&quot;. 0 = tắt phát hiện hủy sát giờ.
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        {LATE_CANCEL_PRESETS.map((preset) => (
          <Button
            key={preset.minutes}
            type="button"
            variant="outline"
            size="sm"
            disabled={updatePolicy.isPending}
            onClick={() => {
              setInput(String(preset.minutes));
              void submitValue(preset.minutes);
            }}
            className="h-7 rounded-lg text-xs font-semibold"
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="mt-1 flex max-w-xs items-center gap-2">
        <div className="relative flex-1">
          <Input
            id="lateCancelThresholdMin"
            inputMode="numeric"
            value={input}
            aria-invalid={Boolean(validationError)}
            onKeyDown={(event) => {
              if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
                event.preventDefault();
              }
            }}
            onChange={(event) => {
              setInput(event.target.value.replace(/[^0-9]/g, ""));
              setValidationError(null);
            }}
            className="rounded-xl pr-14 font-mono"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-500">
            phút
          </span>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={updatePolicy.isPending || input === String(currentValue)}
          className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
        >
          {updatePolicy.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Lưu"
          )}
        </Button>
      </div>
      {validationError && (
        <p className="text-xs font-medium text-red-600">{validationError}</p>
      )}
    </form>
  );
}

export function ExpertCancellationPolicyCard() {
  const policy = useExpertCancellationPolicy();

  return (
    <Card className="max-w-3xl rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
          <ShieldAlert className="h-5 w-5" /> Chính Sách Hủy Lịch Của Expert
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {policy.isLoading ? (
          <div className="flex min-h-44 items-center justify-center text-xs text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải chính
            sách hủy lịch...
          </div>
        ) : policy.isError || !policy.data ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-5 text-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            <p className="text-xs font-medium text-slate-700">
              Không thể tải chính sách hủy lịch.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void policy.refetch()}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" /> Thử lại
            </Button>
          </div>
        ) : (
          <>
            <Alert className="border-amber-200 bg-amber-50/70 text-amber-900">
              <AlertTriangle />
              <AlertDescription className="text-xs text-amber-800">
                Công thức tính điểm: điểm = hủy thường × 1 + (hủy sát giờ +
                no-show) × trọng số. Expert đạt/vượt ngưỡng điểm vi phạm trong
                cửa sổ trượt sẽ bị gắn cờ.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FIELDS.map((field) => (
                <PolicyField
                  key={`${field.key}-${policy.data[field.key]}`}
                  field={field}
                  currentValue={policy.data[field.key]}
                />
              ))}
            </div>

            <LateCancelThresholdField
              key={`lateCancelThresholdMin-${policy.data.lateCancelThresholdMin}`}
              currentValue={policy.data.lateCancelThresholdMin}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
