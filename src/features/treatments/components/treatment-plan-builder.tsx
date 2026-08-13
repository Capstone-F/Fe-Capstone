"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
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
} from "../hooks/useTreatments";
import type {
  ExpertRoutine,
  ExpertRoutineStep,
  RoutinePeriod,
  TreatmentChart,
  TreatmentPhase,
  TreatmentPhasePayload,
  TreatmentPlan,
} from "../types/treatment.types";
import {
  getTreatmentStatusLabel,
  treatmentPhaseStatusLabel,
  treatmentPhaseTypeLabel,
} from "../lib/treatment-labels";
import {
  createTreatmentPlanSchema,
  routineSchema,
  treatmentPhaseFormSchema,
  type CreateTreatmentPlanValues,
  type TreatmentPhaseFormValues,
} from "../schemas/treatment-forms.schema";

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

import { ExpertTreatmentChart } from "./builder/expert-treatment-chart";
import { CreatePlanForm } from "./builder/create-plan-form";
import { PlanSummary } from "./builder/plan-summary";
import { DraftPhaseEditor } from "./builder/draft-phase-editor";
import { PaidPhaseConfiguration } from "./builder/paid-phase-configuration";

export function TreatmentPlanBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const treatmentId = searchParams.get("treatmentId") ?? "";
  const customerId = searchParams.get("customerId");
  const customerName = searchParams.get("customerName") || "Khách hàng";
  const sourceConsultationId = searchParams.get("sourceConsultationId");
  const detail = useTreatmentPlanDetail(treatmentId);
  const createMutation = useCreateTreatmentPlan();
  const existingPlans = useTreatmentPlans(
    "expert",
    {},
    { enabled: !treatmentId && Boolean(customerId) },
  );
  const existingPlan = existingPlans.data?.find(
    (plan) =>
      plan.customerId === customerId &&
      plan.status !== "CANCELLED" &&
      plan.status !== "COMPLETED",
  );

  useEffect(() => {
    if (treatmentId || !existingPlan) return;
    const query = new URLSearchParams({
      treatmentId: existingPlan.id,
      customerId: existingPlan.customerId,
      customerName,
    });
    if (existingPlan.sourceConsultationId || sourceConsultationId) {
      query.set(
        "sourceConsultationId",
        existingPlan.sourceConsultationId || sourceConsultationId || "",
      );
    }
    router.replace(`${pathname}?${query.toString()}`);
  }, [
    customerName,
    existingPlan,
    router,
    pathname,
    sourceConsultationId,
    treatmentId,
  ]);

  if (!treatmentId) {
    if (customerId && (existingPlans.isLoading || existingPlan)) {
      return (
        <div className="flex min-h-[520px] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kiểm tra phác
          đồ hiện có...
        </div>
      );
    }

    if (customerId && existingPlans.isError) {
      return (
        <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 p-6 text-center">
          <CircleAlert className="h-8 w-8 text-red-500" />
          <p className="max-w-md text-sm text-slate-700">
            Không thể kiểm tra phác đồ hiện có. Tạm thời chưa thể tạo mới để
            tránh trùng dữ liệu.
          </p>
          <Button
            variant="outline"
            onClick={() => void existingPlans.refetch()}
          >
            Thử lại
          </Button>
        </div>
      );
    }

    return (
      <CreatePlanForm
        customerId={customerId}
        customerName={customerName}
        sourceConsultationId={sourceConsultationId}
        isPending={createMutation.isPending}
        onCreate={async (payload) => {
          const plan = await createMutation.mutateAsync(payload);
          const query = new URLSearchParams({
            treatmentId: plan.id,
            customerId: plan.customerId,
            customerName,
          });
          if (plan.sourceConsultationId) {
            query.set("sourceConsultationId", plan.sourceConsultationId);
          }
          router.replace(`${pathname}?${query.toString()}`);
        }}
      />
    );
  }

  if (detail.isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải phác đồ...
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-red-600">Không thể tải phác đồ điều trị.</p>
        <Button variant="outline" onClick={() => void detail.refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  const plan = detail.data;
  const canEditDraft = plan.status === "DRAFT" && !plan.paidAt;

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {!pathname.includes("/consultations") && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => router.push("/expert/treatments")}
                aria-label="Quay lại"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-950">
                  {plan.title}
                </h1>
                <Badge variant="outline">{getTreatmentStatusLabel(plan)}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {customerName} · {plan.phases.length} giai đoạn ·{" "}
                {formatVnd(plan.totalPriceVnd ?? 0)}
              </p>
            </div>
          </div>
          {plan.sourceConsultationId &&
            !pathname.includes("/consultations") && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/expert/consultations/${plan.sourceConsultationId}`,
                  )
                }
              >
                Quay lại ca tư vấn
              </Button>
            )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <PlanSummary plan={plan} />
        {canEditDraft ? (
          <DraftPhaseEditor
            plan={plan}
            onRefresh={() => void detail.refetch()}
          />
        ) : plan.status === "ACTIVE" ? (
          <PaidPhaseConfiguration
            phases={plan.phases}
            onRefresh={() => void detail.refetch()}
          />
        ) : (
          <div className="border bg-white p-5 text-sm text-slate-600">
            Phác đồ đang ở trạng thái {getTreatmentStatusLabel(plan)} và không
            thể chỉnh sửa giai đoạn.
          </div>
        )}
        {plan.status !== "DRAFT" && (
          <ExpertTreatmentChart treatmentId={plan.id} />
        )}
      </main>
    </div>
  );
}
