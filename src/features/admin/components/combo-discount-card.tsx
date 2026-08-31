"use client";

import { useState } from "react";
import { Loader2, Percent } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { formatVnd } from "@/shared/utils/format";
import type { ComboDiscountKind } from "../api/admin-commerce.api";
import {
  useAdminComboDiscount,
  useUpdateComboDiscount,
} from "../hooks/useAdminCommerce";

interface ComboDiscountCardProps {
  kind: ComboDiscountKind;
  title: string;
  description: string;
}

export function ComboDiscountCard({
  kind,
  title,
  description,
}: ComboDiscountCardProps) {
  const { data: settings, isLoading } = useAdminComboDiscount(kind);

  return (
    <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
          <Percent className="h-5 w-5 text-[#2C3E35] dark:text-emerald-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading || !settings ? (
          <div className="flex items-center justify-center p-8 text-xs text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#2C3E35]" />{" "}
            Đang tải cấu hình...
          </div>
        ) : (
          <ComboDiscountForm
            key={`${kind}-${settings.percent}-${settings.minSubtotalVnd}`}
            kind={kind}
            description={description}
            percent={settings.percent ?? 10}
            minSubtotalVnd={settings.minSubtotalVnd ?? 0}
          />
        )}
      </CardContent>
    </Card>
  );
}

function ComboDiscountForm({
  kind,
  description,
  percent: currentPercent,
  minSubtotalVnd: currentMinSubtotalVnd,
}: {
  kind: ComboDiscountKind;
  description: string;
  percent: number;
  minSubtotalVnd: number;
}) {
  const [percent, setPercent] = useState(currentPercent);
  const [minSubtotalInput, setMinSubtotalInput] = useState(
    String(currentMinSubtotalVnd),
  );
  const updateCombo = useUpdateComboDiscount(kind);

  const minSubtotalVnd = Number(minSubtotalInput) || 0;
  const isDirty =
    percent !== currentPercent || minSubtotalVnd !== currentMinSubtotalVnd;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateCombo.mutate({ percent, minSubtotalVnd });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${kind}-percent`}
          className="text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          Phần trăm giảm giá (%):
        </Label>
        <Input
          id={`${kind}-percent`}
          type="number"
          min={0}
          max={100}
          value={percent}
          onChange={(e) =>
            setPercent(
              Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)),
            )
          }
          className="rounded-xl border-slate-200 text-xs"
        />
        <span className="text-[11px] text-slate-400">{description}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${kind}-minSubtotalVnd`}
          className="text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          Giá trị đơn tối thiểu (VNĐ):
        </Label>
        <Input
          id={`${kind}-minSubtotalVnd`}
          inputMode="numeric"
          value={minSubtotalInput}
          onKeyDown={(event) => {
            if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
              event.preventDefault();
            }
          }}
          onChange={(event) =>
            setMinSubtotalInput(event.target.value.replace(/[^0-9]/g, ""))
          }
          className="rounded-xl border-slate-200 text-xs"
        />
        <span className="text-[11px] font-semibold text-slate-500">
          Xem trước: {formatVnd(minSubtotalVnd)}
        </span>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={updateCombo.isPending || !isDirty}
          className="w-full rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
        >
          {updateCombo.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Lưu Cấu Hình Combo"
          )}
        </Button>
      </div>
    </form>
  );
}
