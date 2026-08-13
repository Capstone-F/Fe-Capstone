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

export function PlanSummary({
  plan,
}: {
  plan: ReturnType<typeof useTreatmentPlanDetail>["data"];
}) {
  if (!plan) return null;
  return (
    <section className="grid gap-4 border bg-white p-5 md:grid-cols-4">
      <div className="md:col-span-2">
        <p className="text-xs font-medium text-slate-500">Tóm tắt chuyên môn</p>
        <p className="mt-1 text-sm text-slate-800">
          {plan.description || "Chưa có mô tả."}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">Thời gian</p>
        <p className="mt-1 text-sm text-slate-800">
          {plan.startDate} đến {plan.endDate}
        </p>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">Tổng phí</p>
        <p className="mt-1 text-sm font-semibold text-slate-950">
          {formatVnd(plan.totalPriceVnd ?? 0)}
        </p>
      </div>
    </section>
  );
}
