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

export function CreatePlanForm({
  customerId,
  customerName,
  sourceConsultationId,
  isPending,
  onCreate,
}: {
  customerId: string | null;
  customerName: string;
  sourceConsultationId: string | null;
  isPending: boolean;
  onCreate: (payload: {
    customerId: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    sourceConsultationId: string;
  }) => Promise<void>;
}) {
  const router = useRouter();
  const defaultEndDate = new Date();
  defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
  const form = useForm<CreateTreatmentPlanValues>({
    resolver: zodResolver(createTreatmentPlanSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: toLocalDateInput(new Date()),
      endDate: toLocalDateInput(defaultEndDate),
    },
  });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const validSource = isUuid(customerId) && isUuid(sourceConsultationId);

  async function handleSubmit(values: CreateTreatmentPlanValues) {
    if (!customerId || !sourceConsultationId || !validSource) return;
    try {
      await onCreate({
        customerId,
        title: values.title,
        description: values.description || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        sourceConsultationId,
      });
      toast.success("Đã tạo bản nháp phác đồ.");
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể tạo bản nháp.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <Button variant="ghost" onClick={() => router.push("/expert")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>
      <div className="mt-4 border bg-white p-5 sm:p-7">
        <h1 className="text-lg font-semibold text-slate-950">
          Tạo phác đồ cho {customerName}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Khởi tạo bản nháp từ ca tư vấn hiện tại.
        </p>

        {!validSource ? (
          <p className="mt-6 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Thiếu customer hoặc source consultation hợp lệ. Hãy mở thao tác này
            từ ca tư vấn đang diễn ra hoặc đã hoàn thành.
          </p>
        ) : (
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="mt-6 space-y-5"
            noValidate
          >
            <FormController
              control={form.control}
              name="title"
              label="Tên phác đồ"
            >
              {(field) => (
                <Input
                  {...field}
                  id={field.name}
                  maxLength={200}
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
              )}
            </FormController>
            <FormController
              control={form.control}
              name="description"
              label="Tóm tắt đánh giá"
            >
              {(field) => (
                <Textarea
                  {...field}
                  id={field.name}
                  maxLength={2000}
                  rows={4}
                  aria-invalid={Boolean(form.formState.errors.description)}
                />
              )}
            </FormController>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormController
                control={form.control}
                name="startDate"
                label="Ngày bắt đầu"
              >
                {(field) => (
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    aria-invalid={Boolean(form.formState.errors.startDate)}
                  />
                )}
              </FormController>
              <FormController
                control={form.control}
                name="endDate"
                label="Ngày kết thúc"
              >
                {(field) => (
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    min={startDate}
                    aria-invalid={Boolean(form.formState.errors.endDate)}
                  />
                )}
              </FormController>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Tạo bản nháp
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
