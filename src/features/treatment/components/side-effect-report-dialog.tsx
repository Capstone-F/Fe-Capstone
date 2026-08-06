"use client";

import { useState } from "react";
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
import { useReportSideEffect } from "../hooks/useRoutineTracking";

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
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    SideEffectSymptomKey[]
  >([]);
  const [severity, setSeverity] = useState<"MILD" | "MODERATE" | "SEVERE">(
    "MILD",
  );
  const [selectedStepId, setSelectedStepId] = useState<string>("");
  const [affectedArea, setAffectedArea] = useState("");
  const [description, setDescription] = useState("");

  const reportMutation = useReportSideEffect(routineId);

  const toggleSymptom = (sym: SideEffectSymptomKey) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym],
    );
  };

  const handleSubmit = () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 biểu hiện kích ứng.");
      return;
    }

    reportMutation.mutate(
      {
        stepId: selectedStepId || undefined,
        severity,
        symptoms: selectedSymptoms,
        affectedArea: affectedArea.trim() || "Chưa nêu",
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Báo cáo kích ứng đã được gửi tới Bác sĩ phụ trách!");
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

        <div className="flex flex-col gap-4 py-2">
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
          </div>

          {/* Severity Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Mức độ kích ứng:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSeverity("MILD")}
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
                onClick={() => setSeverity("MODERATE")}
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
                onClick={() => setSeverity("SEVERE")}
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
              <select
                value={selectedStepId}
                onChange={(e) => setSelectedStepId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              >
                <option value="">-- Không rõ sản phẩm cụ thể --</option>
                {steps.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Affected area */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Vùng da bị ảnh hưởng:
            </label>
            <input
              type="text"
              placeholder="VD: Toàn bộ mặt, 2 bên má, trán..."
              value={affectedArea}
              onChange={(e) => setAffectedArea(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Ghi chú thêm:
            </label>
            <Textarea
              placeholder="VD: Da bị châm chích 15 phút sau khi thoa Serum..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="rounded-xl border-slate-200 text-xs focus-visible:ring-rose-500"
            />
          </div>
        </div>

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
            type="button"
            disabled={reportMutation.isPending}
            onClick={handleSubmit}
            className="rounded-xl bg-rose-600 text-xs font-bold text-white shadow-xs hover:bg-rose-700"
          >
            {reportMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Gửi Cảnh Báo Cho Bác Sĩ"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
