"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, PackageSearch, RefreshCw } from "lucide-react";
import { toast } from "sonner";

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
  useLowStockThreshold,
  useUpdateLowStockThreshold,
} from "@/features/stock/hooks/useStock";

function getErrorMessage(error: unknown, fallback: string): string {
  const message = (
    error as {
      response?: { data?: { message?: string | string[] } };
      message?: string;
    }
  )?.response?.data?.message;
  if (Array.isArray(message)) return message.join(". ");
  if (typeof message === "string" && message.trim()) return message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function ThresholdForm({ currentThreshold }: { currentThreshold: number }) {
  const [input, setInput] = useState(String(currentThreshold));
  const [validationError, setValidationError] = useState<string | null>(null);
  const updateThreshold = useUpdateLowStockThreshold();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d+$/.test(input)) {
      setValidationError("Ngưỡng cảnh báo phải là số nguyên không âm.");
      return;
    }

    const threshold = Number(input);
    if (!Number.isSafeInteger(threshold) || threshold < 0) {
      setValidationError("Ngưỡng cảnh báo phải là số nguyên không âm.");
      return;
    }

    setValidationError(null);
    try {
      await updateThreshold.mutateAsync(threshold);
      toast.success(`Đã cập nhật ngưỡng cảnh báo thành ${threshold} sản phẩm.`);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Không thể cập nhật ngưỡng cảnh báo tồn kho.",
      );
      setValidationError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <Alert className="border-amber-200 bg-amber-50/70 text-amber-900">
        <AlertTriangle />
        <AlertDescription className="text-xs text-amber-800">
          Sản phẩm có tồn kho từ 1 đến ngưỡng này sẽ được đánh dấu “Sắp hết”.
          Tồn kho bằng 0 luôn được đánh dấu “Hết hàng”.
        </AlertDescription>
      </Alert>
      <div className="space-y-1.5">
        <Label htmlFor="lowStockThreshold" className="text-xs font-bold">
          Số lượng cảnh báo
        </Label>
        <div className="relative">
          <Input
            id="lowStockThreshold"
            inputMode="numeric"
            min={0}
            step={1}
            value={input}
            aria-invalid={Boolean(validationError)}
            aria-describedby={
              validationError ? "lowStockThresholdError" : undefined
            }
            onKeyDown={(event) => {
              if (["e", "E", "+", "-", ".", ","].includes(event.key)) {
                event.preventDefault();
              }
            }}
            onChange={(event) => {
              setInput(event.target.value.replace(/[^0-9]/g, ""));
              setValidationError(null);
            }}
            className="rounded-xl pr-24 font-mono"
          />
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-500">
            sản phẩm
          </span>
        </div>
        {validationError ? (
          <p
            id="lowStockThresholdError"
            className="text-xs font-medium text-red-600"
          >
            {validationError}
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            Giá trị hiện tại: {currentThreshold} sản phẩm.
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={
          updateThreshold.isPending || input === String(currentThreshold)
        }
        className="w-full rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
      >
        {updateThreshold.isPending ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Đang lưu...
          </>
        ) : (
          "Lưu Ngưỡng Cảnh Báo"
        )}
      </Button>
    </form>
  );
}

export function LowStockThresholdCard() {
  const threshold = useLowStockThreshold();

  return (
    <Card className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <CardHeader className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-[#2C3E35] dark:text-emerald-400">
          <PackageSearch className="h-5 w-5" /> Ngưỡng Cảnh Báo Tồn Kho
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {threshold.isLoading ? (
          <div className="flex min-h-44 items-center justify-center text-xs text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải ngưỡng
            cảnh báo...
          </div>
        ) : threshold.isError || !threshold.data ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-5 text-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            <p className="text-xs font-medium text-slate-700">
              Không thể tải ngưỡng cảnh báo tồn kho.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void threshold.refetch()}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" /> Thử lại
            </Button>
          </div>
        ) : (
          <ThresholdForm
            key={threshold.data.threshold}
            currentThreshold={threshold.data.threshold}
          />
        )}
      </CardContent>
    </Card>
  );
}
