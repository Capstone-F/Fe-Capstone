"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Frown, Loader2, Meh, Smile, Sparkles } from "lucide-react";
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
import { useSubmitWeeklyCheckIn } from "../hooks/useRoutineTracking";
import {
  weeklyCheckInSchema,
  type WeeklyCheckInFormValues,
} from "../schemas/routine-tracking-forms.schema";

interface WeeklyCheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routineId: string;
}

export type OverallFeeling = "BETTER" | "SAME" | "WORSE";
export type WeeklySymptom =
  | "oiliness"
  | "dryness"
  | "redness"
  | "acne"
  | "peeling";

const FEELINGS: {
  key: OverallFeeling;
  label: string;
  icon: typeof Smile;
  color: string;
}[] = [
  {
    key: "BETTER",
    label: "Tốt hơn",
    icon: Smile,
    color: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    key: "SAME",
    label: "Như cũ",
    icon: Meh,
    color: "border-amber-500 bg-amber-50 text-amber-700",
  },
  {
    key: "WORSE",
    label: "Kém hơn",
    icon: Frown,
    color: "border-rose-500 bg-rose-50 text-rose-700",
  },
];

const SYMPTOMS: { key: WeeklySymptom; label: string }[] = [
  { key: "oiliness", label: "Dầu" },
  { key: "dryness", label: "Khô" },
  { key: "redness", label: "Đỏ" },
  { key: "acne", label: "Mụn" },
  { key: "peeling", label: "Bong da" },
];

export function RoutineWeeklyCheckInDialog({
  isOpen,
  onClose,
  routineId,
}: WeeklyCheckInDialogProps) {
  const form = useForm<WeeklyCheckInFormValues>({
    resolver: zodResolver(weeklyCheckInSchema),
    defaultValues: { feeling: "SAME", symptoms: [], note: "" },
  });
  const feeling = useWatch({ control: form.control, name: "feeling" });
  const selectedSymptoms = useWatch({
    control: form.control,
    name: "symptoms",
  });

  const submitMutation = useSubmitWeeklyCheckIn(routineId);

  const toggleSymptom = (sym: WeeklySymptom) => {
    form.setValue(
      "symptoms",
      selectedSymptoms.includes(sym)
        ? selectedSymptoms.filter((item) => item !== sym)
        : [...selectedSymptoms, sym],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleSubmit = (values: WeeklyCheckInFormValues) => {
    submitMutation.mutate(
      {
        feeling: values.feeling,
        symptoms: values.symptoms,
        notes: values.note || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã hoàn tất gửi check-in tuần!");
          form.reset();
          onClose();
        },
        onError: (err) => {
          toast.error(
            (err as Error)?.message || "Không thể gửi check-in tuần.",
          );
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl p-6 sm:max-w-md">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Check-in Tiến Trình Tuần
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Ghi nhận xu hướng phục hồi tuần này để Bác sĩ đánh giá hiệu quả phác
            đồ.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 py-2"
        >
          {/* Cảm nhận chung */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Cảm nhận chung tuần này
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FEELINGS.map((item) => {
                const Icon = item.icon;
                const active = feeling === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      form.setValue("feeling", item.key, {
                        shouldDirty: true,
                      })
                    }
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                      active
                        ? item.color
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tình trạng da */}
          <div className="space-y-2">
            <label className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Tình trạng da ghi nhận
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((symptom) => {
                const active = selectedSymptoms.includes(symptom.key);
                return (
                  <button
                    key={symptom.key}
                    type="button"
                    onClick={() => toggleSymptom(symptom.key)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      active
                        ? "border-amber-500 bg-amber-500 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {symptom.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ghi chú */}
          <FormController
            control={form.control}
            name="note"
            label="Ghi chú tiến trình cho Bác sĩ"
          >
            {(field) => (
              <Textarea
                {...field}
                placeholder="Nhập ghi chú chi tiết cho tuần này..."
                rows={3}
                className="rounded-xl border-slate-200 text-xs focus-visible:ring-amber-500"
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
              disabled={submitMutation.isPending}
              className="rounded-xl bg-amber-500 text-xs font-bold text-white shadow-xs hover:bg-amber-600"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Gửi Check-in Tuần"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
