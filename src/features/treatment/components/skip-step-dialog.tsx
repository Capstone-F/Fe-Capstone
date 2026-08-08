"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { FormController } from "@/shared/components/form/form-controller";
import {
  SKIP_REASON_LABELS,
  SKIP_REASON_OPTIONS,
} from "../constants/routine-tracking";
import type { SkipStepPayload } from "../types/routine-tracking.types";
import {
  skipStepSchema,
  type SkipStepFormValues,
} from "../schemas/routine-tracking-forms.schema";

interface SkipStepDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stepName: string;
  isPending: boolean;
  onSubmit: (payload: SkipStepPayload) => void;
}

export function SkipStepDialog({
  open,
  onOpenChange,
  stepName,
  isPending,
  onSubmit,
}: SkipStepDialogProps) {
  const form = useForm<SkipStepFormValues>({
    resolver: zodResolver(skipStepSchema),
    defaultValues: { reason: "FORGOT", note: "" },
  });
  const reason = useWatch({ control: form.control, name: "reason" });

  const handleSubmit = (values: SkipStepFormValues) => {
    onSubmit({
      reason: values.reason,
      note: values.note || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">
            Bỏ qua bước: {stepName}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4 pt-2"
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">
              Lý do bỏ qua
            </label>
            <div className="flex flex-col gap-2">
              {SKIP_REASON_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    form.setValue("reason", option, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-all ${
                    reason === option
                      ? "border-[#6b5cf6] bg-[#6b5cf6]/5 text-[#6b5cf6]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {SKIP_REASON_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <FormController
            control={form.control}
            name="note"
            label={`Ghi chú ${reason === "OTHER" ? "(bắt buộc)" : "(không bắt buộc)"}`}
          >
            {(field) => (
              <Textarea
                {...field}
                placeholder="Ví dụ: sản phẩm vừa hết, đang chờ giao..."
                className="h-20 text-xs"
              />
            )}
          </FormController>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
            >
              Xác nhận bỏ qua
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
