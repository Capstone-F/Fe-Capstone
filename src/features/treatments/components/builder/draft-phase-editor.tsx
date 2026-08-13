"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarCheck,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Circle,
  CircleAlert,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Sun,
  Moon,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { formatVnd } from "@/shared/utils/format";
import { FormController } from "@/shared/components/form/form-controller";
import { CurrencyInput } from "@/shared/components/form/currency-input";
import { cn } from "@/lib/utils";
import {
  useActivatePhase,
  useAddPhase,
  useCreateTreatmentPlan,
  useDeletePhase,
  useGenerateRoutine,
  useIngredients,
  useProductCandidates,
  useSaveRoutine,
  useSetPhaseIngredients,
  useSetPhaseProducts,
  useSubmitPlan,
  useTreatmentChart,
  useTreatmentPlanDetail,
  useTreatmentPlans,
  useUpdatePhase,
  useUpdateRoutine,
} from "../../hooks/useTreatments";
import type {
  ExpertRoutine,
  ExpertRoutineStep,
  RoutinePeriod,
  TreatmentChart,
  TreatmentPhase,
  TreatmentPhasePayload,
  TreatmentPlan,
} from "../../types/treatment.types";
import {
  getTreatmentStatusLabel,
  treatmentPhaseStatusLabel,
  treatmentPhaseTypeLabel,
} from "../../lib/treatment-labels";
import {
  createTreatmentPlanSchema,
  routineSchema,
  treatmentPhaseFormSchema,
  type CreateTreatmentPlanValues,
  type TreatmentPhaseFormValues,
} from "../../schemas/treatment-forms.schema";

const isUuid = (value: string | null) =>
  Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    ),
  );

function toLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function translateSubmitError(reason: unknown): string {
  const fallback = "Không thể gửi phác đồ cho khách hàng.";
  if (!(reason instanceof Error)) return fallback;
  const message = reason.message;
  if (message.includes("at least one phase")) {
    return "Phác đồ cần có ít nhất một giai đoạn điều trị.";
  }
  if (message.includes("noteByExpert")) {
    return "Mỗi giai đoạn cần có lý do chuyên môn trước khi gửi.";
  }
  if (message.includes("greater than 0")) {
    return "Tổng phí phác đồ phải lớn hơn 0 đồng.";
  }
  if (message.includes("startDate") || message.includes("endDate")) {
    return "Cần nhập đủ ngày bắt đầu và ngày kết thúc phác đồ.";
  }
  return message || fallback;
}

export function DraftPhaseEditor({
  plan,
  onRefresh,
}: {
  plan: TreatmentPlan;
  onRefresh: () => void;
}) {
  const treatmentId = plan.id;
  const phases = plan.phases;
  const addMutation = useAddPhase();
  const updateMutation = useUpdatePhase();
  const deleteMutation = useDeletePhase();
  const submitMutation = useSubmitPlan();
  const [showNew, setShowNew] = useState(phases.length === 0);
  const [dirtyPhaseIds, setDirtyPhaseIds] = useState<Set<string>>(new Set());

  const updateDirtyPhase = useCallback((formKey: string, dirty: boolean) => {
    setDirtyPhaseIds((current) => {
      const next = new Set(current);
      if (dirty) next.add(formKey);
      else next.delete(formKey);
      if (
        next.size === current.size &&
        [...next].every((id) => current.has(id))
      ) {
        return current;
      }
      return next;
    });
  }, []);

  const hasUnsavedChanges = showNew || dirtyPhaseIds.size > 0;
  const totalPhasePrice = phases.reduce(
    (total, phase) => total + phase.priceVnd,
    0,
  );
  const submissionChecks = [
    {
      label: "Đã nhập ngày bắt đầu và ngày kết thúc phác đồ",
      complete: Boolean(plan.startDate && plan.endDate),
    },
    {
      label: "Có ít nhất một giai đoạn điều trị",
      complete: phases.length > 0,
    },
    {
      label: "Mỗi giai đoạn có lý do chuyên môn",
      complete:
        phases.length > 0 &&
        phases.every((phase) => Boolean(phase.noteByExpert?.trim())),
    },
    {
      label: "Tổng phí phác đồ lớn hơn 0 đồng",
      complete: totalPhasePrice > 0,
    },
    {
      label: "Không còn thay đổi chưa lưu",
      complete: !hasUnsavedChanges,
    },
  ];
  const canSubmit =
    plan.canSubmitForPayment &&
    !hasUnsavedChanges &&
    !plan.isSubmittedForPayment;
  const defaultOpenPhases = phases
    .filter((phase) => !phase.noteByExpert?.trim())
    .map((phase) => phase.id);
  if (defaultOpenPhases.length === 0 && phases[0]) {
    defaultOpenPhases.push(phases[0].id);
  }

  async function submitForPayment() {
    try {
      await submitMutation.mutateAsync(treatmentId);
      toast.success("Đã gửi phác đồ cho khách hàng thanh toán.");
      onRefresh();
    } catch (reason) {
      toast.error(translateSubmitError(reason));
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Các giai đoạn điều trị
          </h2>
          <p className="text-xs text-slate-500">
            Có thể lưu bản nháp trước, sau đó hoàn thiện để gửi khách hàng.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm giai đoạn
        </Button>
      </div>

      {phases.length > 0 && (
        <Accordion
          multiple
          defaultValue={defaultOpenPhases}
          className="overflow-hidden border bg-white"
        >
          {phases.map((phase) => {
            const complete = Boolean(phase.noteByExpert?.trim());
            return (
              <AccordionItem key={phase.id} value={phase.id}>
                <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
                  <div className="flex min-w-0 flex-1 flex-col gap-2 pr-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {complete ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <CircleAlert className="h-5 w-5 shrink-0 text-amber-600" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">
                          Giai đoạn {phase.phaseOrder + 1}:{" "}
                          {phase.title || "Chưa đặt tên"}
                        </p>
                        <p className="mt-0.5 text-xs font-normal text-slate-500">
                          {treatmentPhaseTypeLabel[phase.phaseType]}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 pl-8 sm:pl-0">
                      <Badge variant="outline">
                        {treatmentPhaseStatusLabel[phase.status]}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-700">
                        {formatVnd(phase.priceVnd)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t bg-slate-50/60 px-4 py-4 sm:px-5">
                  <PhaseForm
                    key={`${phase.id}:${phase.ingredients.map((item) => item.ingredientId).join(",")}:${phase.products.map((item) => item.productVariantId).join(",")}`}
                    formKey={phase.id}
                    phase={phase}
                    submitLabel="Lưu giai đoạn"
                    isPending={
                      updateMutation.isPending || deleteMutation.isPending
                    }
                    onDirtyChange={updateDirtyPhase}
                    onSubmit={async (payload) => {
                      await updateMutation.mutateAsync({
                        phaseId: phase.id,
                        treatmentId,
                        payload,
                      });
                      toast.success(
                        `Đã lưu giai đoạn ${phase.phaseOrder + 1}.`,
                      );
                      onRefresh();
                    }}
                    onDelete={async () => {
                      await deleteMutation.mutateAsync({
                        phaseId: phase.id,
                        treatmentId,
                      });
                      toast.success("Đã xóa giai đoạn.");
                      onRefresh();
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {showNew && (
        <section className="border border-emerald-200 bg-white">
          <div className="border-b bg-emerald-50/60 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-950">
              Giai đoạn mới
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Nhập phí hợp lệ để lưu bản nháp; các nội dung chuyên môn có thể
              hoàn thiện sau.
            </p>
          </div>
          <div className="p-4 sm:p-5">
            <PhaseForm
              formKey="new-phase"
              phaseOrder={
                phases.length
                  ? Math.max(...phases.map((phase) => phase.phaseOrder)) + 1
                  : 0
              }
              submitLabel="Tạo giai đoạn"
              isPending={addMutation.isPending}
              onCancel={() => setShowNew(false)}
              onSubmit={async (payload) => {
                await addMutation.mutateAsync({ treatmentId, payload });
                toast.success("Đã thêm giai đoạn.");
                setShowNew(false);
                onRefresh();
              }}
            />
          </div>
        </section>
      )}

      {hasUnsavedChanges && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-950">
          <TriangleAlert />
          <AlertTitle>Có thay đổi chưa lưu</AlertTitle>
          <AlertDescription className="text-amber-800">
            Các trường đã chỉnh sửa được đánh dấu màu vàng. Hãy lưu hoặc hủy
            thay đổi trước khi gửi phác đồ.
          </AlertDescription>
        </Alert>
      )}

      <section className="border bg-white p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-emerald-700" />
              <h3 className="text-sm font-semibold text-slate-950">
                Kiểm tra trước thanh toán
              </h3>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {submissionChecks.map((check) => (
                <div
                  key={check.label}
                  className={cn(
                    "flex items-start gap-2 text-xs",
                    check.complete ? "text-emerald-700" : "text-amber-700",
                  )}
                >
                  {check.complete ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{check.label}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            className="w-full lg:w-auto"
            disabled={!canSubmit || submitMutation.isPending}
            onClick={() => void submitForPayment()}
          >
            {submitMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : plan.isSubmittedForPayment ? (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            ) : (
              <ClipboardCheck className="mr-2 h-4 w-4" />
            )}
            {plan.isSubmittedForPayment
              ? "Đã gửi khách hàng thanh toán"
              : "Gửi khách hàng thanh toán"}
          </Button>
        </div>
      </section>
    </section>
  );
}

function PhaseForm({
  formKey,
  phase,
  phaseOrder = 0,
  submitLabel,
  isPending,
  onSubmit,
  onDelete,
  onCancel,
  onDirtyChange,
}: {
  formKey: string;
  phase?: TreatmentPhase;
  phaseOrder?: number;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: TreatmentPhasePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
  onDirtyChange?: (formKey: string, dirty: boolean) => void;
}) {
  const form = useForm<TreatmentPhaseFormValues>({
    resolver: zodResolver(treatmentPhaseFormSchema),
    defaultValues: {
      phaseType: phase?.phaseType ?? "ACTIVE_TREATMENT",
      title: phase?.title ?? "",
      goals: phase?.goals ?? "",
      notes: phase?.notes ?? "",
      noteByExpert: phase?.noteByExpert ?? "",
      priceVnd: phase ? String(phase.priceVnd) : "",
      startDate: phase?.startDate ?? "",
      endDate: phase?.endDate ?? "",
    },
  });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const dirtyFields = form.formState.dirtyFields;
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    onDirtyChange?.(formKey, isDirty);
  }, [formKey, isDirty, onDirtyChange]);

  useEffect(
    () => () => {
      onDirtyChange?.(formKey, false);
    },
    [formKey, onDirtyChange],
  );

  async function handleSubmit(values: TreatmentPhaseFormValues) {
    try {
      await onSubmit({
        phaseType: values.phaseType,
        phaseOrder: phase?.phaseOrder ?? phaseOrder,
        title: values.title || null,
        goals: values.goals || null,
        notes: values.notes || null,
        noteByExpert: values.noteByExpert || null,
        priceVnd: Number(values.priceVnd),
        startDate: values.startDate || null,
        endDate: values.endDate || null,
      });
      form.reset(values);
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu giai đoạn.",
      );
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <FormController
          control={form.control}
          name="phaseType"
          label="Loại giai đoạn"
        >
          {(field) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id={field.name}
                className={cn(
                  "w-full",
                  dirtyFields.phaseType && "border-amber-400 bg-amber-50/60",
                )}
              >
                <SelectValue>
                  {treatmentPhaseTypeLabel[field.value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(treatmentPhaseTypeLabel).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
        </FormController>
        <FormController
          control={form.control}
          name="title"
          label="Tên giai đoạn"
        >
          {(field) => (
            <Input
              {...field}
              id={field.name}
              maxLength={200}
              className={cn(
                dirtyFields.title && "border-amber-400 bg-amber-50/60",
              )}
              aria-invalid={Boolean(form.formState.errors.title)}
            />
          )}
        </FormController>
        <FormController
          control={form.control}
          name="goals"
          label="Mục tiêu"
          className="md:col-span-2"
        >
          {(field) => (
            <Textarea
              {...field}
              id={field.name}
              rows={2}
              maxLength={2000}
              className={cn(
                dirtyFields.goals && "border-amber-400 bg-amber-50/60",
              )}
              aria-invalid={Boolean(form.formState.errors.goals)}
            />
          )}
        </FormController>
        <FormController
          control={form.control}
          name="noteByExpert"
          label="Lý do chuyên môn dùng trong hồ sơ bệnh án"
          className="md:col-span-2"
        >
          {(field) => (
            <Textarea
              {...field}
              id={field.name}
              rows={3}
              maxLength={4000}
              className={cn(
                dirtyFields.noteByExpert && "border-amber-400 bg-amber-50/60",
              )}
              aria-invalid={Boolean(form.formState.errors.noteByExpert)}
            />
          )}
        </FormController>
        <FormController
          control={form.control}
          name="notes"
          label="Ghi chú vận hành"
          className="md:col-span-2"
        >
          {(field) => (
            <Textarea
              {...field}
              id={field.name}
              rows={2}
              maxLength={2000}
              className={cn(
                dirtyFields.notes && "border-amber-400 bg-amber-50/60",
              )}
              aria-invalid={Boolean(form.formState.errors.notes)}
            />
          )}
        </FormController>
        <FormController
          control={form.control}
          name="priceVnd"
          label="Phí giai đoạn (VND)"
        >
          {(field) => (
            <CurrencyInput
              id={field.name}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value}
              onValueChange={field.onChange}
              aria-invalid={Boolean(form.formState.errors.priceVnd)}
              className={cn(
                dirtyFields.priceVnd && "border-amber-400 bg-amber-50/60",
              )}
            />
          )}
        </FormController>
        <div className="grid grid-cols-2 gap-3">
          <FormController
            control={form.control}
            name="startDate"
            label="Bắt đầu"
          >
            {(field) => (
              <Input
                {...field}
                id={field.name}
                type="date"
                className={cn(
                  dirtyFields.startDate && "border-amber-400 bg-amber-50/60",
                )}
              />
            )}
          </FormController>
          <FormController
            control={form.control}
            name="endDate"
            label="Kết thúc"
          >
            {(field) => (
              <Input
                {...field}
                id={field.name}
                type="date"
                min={startDate}
                className={cn(
                  dirtyFields.endDate && "border-amber-400 bg-amber-50/60",
                )}
                aria-invalid={Boolean(form.formState.errors.endDate)}
              />
            )}
          </FormController>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Hủy
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="outline"
            onClick={() => void onDelete()}
            disabled={isPending}
            className="text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Xóa
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
