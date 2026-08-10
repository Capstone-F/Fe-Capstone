"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { FormController } from "@/shared/components/form/form-controller";
import { useReportSideEffect } from "../hooks/useRoutineTracking";
import {
  sideEffectReportSchema,
  type SideEffectReportFormValues,
} from "../schemas/routine-tracking-forms.schema";

export type SideEffectSymptomKey =
  | "redness"
  | "burning"
  | "itching"
  | "peeling"
  | "swelling"
  | "blistering"
  | "new_breakout";

const SYMPTOMS: { key: SideEffectSymptomKey; label: string }[] = [
  { key: "redness", label: "Đỏ" },
  { key: "burning", label: "Châm chích" },
  { key: "itching", label: "Ngứa" },
  { key: "peeling", label: "Bong da" },
  { key: "swelling", label: "Sưng" },
  { key: "blistering", label: "Phồng rộp" },
  { key: "new_breakout", label: "Mụn nặng" },
];

interface SideEffectReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routineId: string;
  steps?: { id: string; name: string }[];
}

export function SideEffectReportDialog({
  isOpen,
  onClose,
  routineId,
  steps = [],
}: SideEffectReportDialogProps) {
  const form = useForm<SideEffectReportFormValues>({
    resolver: zodResolver(sideEffectReportSchema),
    defaultValues: {
      symptoms: [],
      severity: "MILD",
      selectedStepId: "",
      affectedArea: "",
      description: "",
    },
  });
  const selectedSymptoms = useWatch({
    control: form.control,
    name: "symptoms",
  });
  const severity = useWatch({ control: form.control, name: "severity" });

  const reportMutation = useReportSideEffect(routineId);

  const toggleSymptom = (sym: SideEffectSymptomKey) => {
    form.setValue(
      "symptoms",
      selectedSymptoms.includes(sym)
        ? selectedSymptoms.filter((item) => item !== sym)
        : [...selectedSymptoms, sym],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleSubmit = (values: SideEffectReportFormValues) => {
    reportMutation.mutate(
      {
        stepId: values.selectedStepId || undefined,
        severity: values.severity,
        symptoms: values.symptoms,
        affectedArea: values.affectedArea || "Chưa nêu",
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Báo cáo kích ứng đã được gửi tới Bác sĩ phụ trách!");
          form.reset();
          onClose();
        },
        onError: (err) => {
          toast.error((err as Error)?.message || "Không thể gửi báo cáo.");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-rose-600">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            Báo Cáo Kích Ứng Da
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Ghi nhận phản ứng bất thường để Bác sĩ điều chỉnh phác đồ kịp thời.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          {/* Biểu hiện kích ứng */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Biểu hiện kích ứng đang gặp phải:
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((symptom) => {
                const active = selectedSymptoms.includes(symptom.key);
                return (
                  <button
                    key={symptom.key}
                    type="button"
                    onClick={() => toggleSymptom(symptom.key)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                      active
                        ? "border-rose-500 bg-rose-500 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {symptom.label}
                  </button>
                );
              })}
            </div>
            {form.formState.errors.symptoms?.message && (
              <p className="text-xs text-red-600">
                {form.formState.errors.symptoms.message}
              </p>
            )}
          </div>

          {/* Severity Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Mức độ kích ứng:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => form.setValue("severity", "MILD")}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                  severity === "MILD"
                    ? "border-amber-500 bg-amber-50 text-amber-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Nhẹ (Mild)
              </button>
              <button
                type="button"
                onClick={() => form.setValue("severity", "MODERATE")}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                  severity === "MODERATE"
                    ? "border-orange-500 bg-orange-50 text-orange-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Vừa (Moderate)
              </button>
              <button
                type="button"
                onClick={() => form.setValue("severity", "SEVERE")}
                className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                  severity === "SEVERE"
                    ? "border-rose-500 bg-rose-50 text-rose-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Nặng (Severe)
              </button>
            </div>
          </div>

          {/* Step Selector */}
          {steps.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                Sản phẩm nghi ngờ gây kích ứng:
              </label>
              <FormController control={form.control} name="selectedStepId">
                {(field) => (
                  <select
                    {...field}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="">-- Không rõ sản phẩm cụ thể --</option>
                    {steps.map((step) => (
                      <option key={step.id} value={step.id}>
                        {step.name}
                      </option>
                    ))}
                  </select>
                )}
              </FormController>
            </div>
          )}

          {/* Affected area */}
          <FormController
            control={form.control}
            name="affectedArea"
            label="Vùng da bị ảnh hưởng"
          >
            {(field) => (
              <input
                {...field}
                type="text"
                placeholder="VD: Toàn bộ mặt, 2 bên má, trán..."
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            )}
          </FormController>

          {/* Description */}
          <FormController
            control={form.control}
            name="description"
            label="Ghi chú thêm"
          >
            {(field) => (
              <Textarea
                {...field}
                placeholder="VD: Da bị châm chích 15 phút sau khi thoa Serum..."
                rows={3}
                className="rounded-xl border-slate-200 text-xs focus-visible:ring-rose-500"
              />
            )}
          </FormController>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={reportMutation.isPending}
              className="rounded-xl bg-rose-600 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
            >
              {reportMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Gửi Cảnh Báo Cho Bác Sĩ"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
