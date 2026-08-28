"use client";

import { useState } from "react";
import { AlertTriangle, CalendarClock, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useSession } from "@/features/auth/hooks/useSession";
import { hasRole } from "@/features/auth/utils/role-utils";
import {
  useBookingSettings,
  useUpdateBookingSettings,
} from "../hooks/useAdminBookingSettings";
import type { BookingSettingsDto } from "../types/admin-booking-settings.types";

function formatHours(minutes: number): string {
  if (minutes % 60 === 0) return `${minutes / 60} giờ`;
  return `${(minutes / 60).toFixed(1)} giờ`;
}

interface SettingFieldConfig {
  key: keyof BookingSettingsDto;
  label: string;
  description: string;
  min: number;
  max: number;
}

const FIELDS: SettingFieldConfig[] = [
  {
    key: "confirmTimeoutMin",
    label: "Thời gian chờ Expert xác nhận",
    description:
      'Booking "chờ xác nhận" quá thời gian này sẽ tự hủy và hoàn ví. Deadline thực tế là mốc sớm hơn giữa giá trị này và giờ bắt đầu slot.',
    min: 1,
    max: 10080,
  },
  {
    key: "noShowGraceMin",
    label: "Thời gian ân hạn no-show",
    description:
      "Booking đã xác nhận nhưng chưa bắt đầu sau giờ hẹn cộng thời gian này sẽ bị hủy vì Expert no-show.",
    min: 0,
    max: 1440,
  },
  {
    key: "minLeadTimeMin",
    label: "Thời gian đặt trước tối thiểu",
    description:
      "Khoảng cách tối thiểu giữa lúc khách đặt và giờ bắt đầu slot. 0 = tắt kiểm tra.",
    min: 0,
    max: 1440,
  },
];

function SettingRow({
  field,
  currentValue,
  canEdit,
}: {
  field: SettingFieldConfig;
  currentValue: number;
  canEdit: boolean;
}) {
  const [input, setInput] = useState(String(currentValue));
  const [validationError, setValidationError] = useState<string | null>(null);
  const updateSettings = useUpdateBookingSettings();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(input)) {
      setValidationError("Giá trị phải là số nguyên không âm.");
      return;
    }

    const value = Number(input);
    if (value < field.min || value > field.max) {
      setValidationError(
        `Giá trị phải nằm trong khoảng ${field.min}–${field.max} phút.`,
      );
      return;
    }

    setValidationError(null);
    try {
      await updateSettings.mutateAsync({ [field.key]: value });
    } catch {
      // toast is already shown by the mutation's onError handler
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
          disabled={!canEdit}
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
      {canEdit && (
        <Button
          type="submit"
          size="sm"
          disabled={updateSettings.isPending || input === String(currentValue)}
          className="w-full rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
        >
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Lưu"
          )}
        </Button>
      )}
      {validationError ? (
        <p className="text-xs font-medium text-red-600">{validationError}</p>
      ) : (
        <p className="text-xs text-slate-400">
          Hiện tại: {currentValue} phút ({formatHours(currentValue)}).
        </p>
      )}
    </form>
  );
}

export function BookingSettingsCard() {
  const { data: session } = useSession();
  const canEdit = hasRole(session?.roles, "app_admin");
  const settings = useBookingSettings();

  return (
    <Card className="max-w-3xl rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
          <CalendarClock className="h-5 w-5" /> Cài Đặt Lịch Hẹn
        </CardTitle>
        {!canEdit && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chỉ Admin mới có thể chỉnh sửa các giá trị này.
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-6">
        {settings.isLoading ? (
          <div className="flex min-h-44 items-center justify-center text-xs text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải cài đặt
            lịch hẹn...
          </div>
        ) : settings.isError || !settings.data ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-5 text-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            <p className="text-xs font-medium text-slate-700">
              Không thể tải cài đặt lịch hẹn.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void settings.refetch()}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" /> Thử lại
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {FIELDS.map((field) => (
              <SettingRow
                key={`${field.key}-${settings.data[field.key]}`}
                field={field}
                currentValue={settings.data[field.key]}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
