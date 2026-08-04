"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
  Sparkles,
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
  TreatmentPhaseType,
  TreatmentPlan,
} from "../types/treatment.types";
import {
  getTreatmentStatusLabel,
  treatmentPhaseStatusLabel,
  treatmentPhaseTypeLabel,
} from "../lib/treatment-labels";

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

export function TreatmentPlanBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    (plan) => plan.customerId === customerId,
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
    router.replace(`/expert/treatments/builder?${query.toString()}`);
  }, [customerName, existingPlan, router, sourceConsultationId, treatmentId]);

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
          router.replace(`/expert/treatments/builder?${query.toString()}`);
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
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push("/expert/treatments")}
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
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
          {plan.sourceConsultationId && (
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

function ExpertTreatmentChart({ treatmentId }: { treatmentId: string }) {
  const chartQuery = useTreatmentChart(treatmentId);

  if (chartQuery.isLoading) {
    return (
      <section className="flex min-h-36 items-center justify-center border bg-white text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải hồ sơ điều
        trị...
      </section>
    );
  }

  if (chartQuery.isError || !chartQuery.data) {
    return (
      <section className="border border-red-200 bg-white p-5">
        <p className="text-sm text-red-700">
          Chuyên gia không thể tải hồ sơ điều trị này.
        </p>
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => void chartQuery.refetch()}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
        </Button>
      </section>
    );
  }

  const chart = chartQuery.data;
  const consultations = [
    chart.consultationResults.sourceConsultation,
    ...chart.consultationResults.followUpSessions,
  ].filter((session): session is NonNullable<typeof session> =>
    Boolean(session),
  );

  return (
    <section className="border bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <Activity className="h-4 w-4 text-emerald-700" /> Hồ sơ điều trị
        </h2>
      </div>

      <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <ChartMetric
          icon={<Camera className="h-4 w-4" />}
          label="Ảnh tiến độ"
          value={`${chart.progressPhotos.length} ảnh`}
        />
        <ChartMetric
          icon={<PackageCheck className="h-4 w-4" />}
          label="Lượt dùng sản phẩm"
          value={`${chart.productsUsed.reduce((sum, item) => sum + item.completedCount, 0)} lượt`}
        />
        <ChartMetric
          icon={<CalendarCheck className="h-4 w-4" />}
          label="Lần tư vấn"
          value={`${consultations.length + chart.inPersonSessions.length} lần`}
        />
      </div>

      <div className="grid gap-6 border-t p-5 lg:grid-cols-2">
        <ChartPhaseNotes chart={chart} />
        <ChartActivity chart={chart} consultations={consultations} />
      </div>

      {chart.progressPhotos.length > 0 && (
        <div className="border-t p-5">
          <h3 className="text-sm font-semibold text-slate-950">Ảnh tiến độ</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {chart.progressPhotos.map((photo) => (
              <figure key={photo.id}>
                {photo.photoUrl ? (
                  <Image
                    src={photo.photoUrl}
                    alt={photo.title}
                    width={320}
                    height={320}
                    unoptimized
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center bg-slate-100 text-slate-400">
                    <Camera className="h-5 w-5" />
                  </div>
                )}
                <figcaption className="mt-1 text-xs text-slate-600">
                  {photo.title}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ChartMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-5">
      <span className="text-emerald-700">{icon}</span>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function ChartPhaseNotes({ chart }: { chart: TreatmentChart }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">
        Ghi chú theo giai đoạn
      </h3>
      <div className="mt-3 space-y-3">
        {chart.phases.map((phase) => (
          <article
            key={phase.id}
            className="border-l-2 border-emerald-600 pl-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-900">
                Giai đoạn {phase.phaseOrder + 1}:{" "}
                {phase.title || "Chưa đặt tên"}
              </p>
              <Badge variant="outline">
                {treatmentPhaseStatusLabel[phase.status]}
              </Badge>
            </div>
            <p className="mt-1 text-sm whitespace-pre-wrap text-slate-600">
              {phase.noteByExpert || "Chưa có ghi chú chuyên môn."}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ChartActivity({
  chart,
  consultations,
}: {
  chart: TreatmentChart;
  consultations: TreatmentChart["inPersonSessions"];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-950">
        Hoạt động và sản phẩm
      </h3>
      <div className="mt-3 space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Consultation</p>
          {consultations.length > 0 ? (
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              {consultations.map((session) => (
                <li key={session.id}>
                  {session.isFollowUp ? "Tái khám" : "Tư vấn ban đầu"} ·{" "}
                  {session.status}
                  {session.scheduledAt ? ` · ${session.scheduledAt}` : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Chưa có dữ liệu.</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">
            Sản phẩm đã sử dụng
          </p>
          {chart.productsUsed.length > 0 ? (
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              {chart.productsUsed.map((item) => (
                <li key={item.productVariantId}>
                  {item.productName || item.sku || item.productVariantId} ·{" "}
                  {item.completedCount} lượt
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Chưa có dữ liệu.</p>
          )}
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">
            Tái khám trực tiếp
          </p>
          <p className="mt-1 text-sm text-slate-700">
            {chart.inPersonSessions.length} buổi
          </p>
        </div>
      </div>
    </div>
  );
}

function CreatePlanForm({
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(() =>
    toLocalDateInput(new Date()),
  );
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return toLocalDateInput(date);
  });
  const validSource = isUuid(customerId) && isUuid(sourceConsultationId);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!customerId || !sourceConsultationId || !validSource) return;
    try {
      await onCreate({
        customerId,
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate,
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
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="plan-title">Tên phác đồ</Label>
              <Input
                id="plan-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={200}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-description">Tóm tắt đánh giá</Label>
              <Textarea
                id="plan-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-start">Ngày bắt đầu</Label>
                <Input
                  id="plan-start"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-end">Ngày kết thúc</Label>
                <Input
                  id="plan-end"
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isPending || !title.trim() || endDate < startDate}
            >
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

function PlanSummary({
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

function DraftPhaseEditor({
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
  const [phaseType, setPhaseType] = useState<TreatmentPhaseType>(
    phase?.phaseType ?? "ACTIVE_TREATMENT",
  );
  const [title, setTitle] = useState(phase?.title ?? "");
  const [goals, setGoals] = useState(phase?.goals ?? "");
  const [notes, setNotes] = useState(phase?.notes ?? "");
  const [noteByExpert, setNoteByExpert] = useState(phase?.noteByExpert ?? "");
  const [priceVnd, setPriceVnd] = useState(phase ? String(phase.priceVnd) : "");
  const [startDate, setStartDate] = useState(phase?.startDate ?? "");
  const [endDate, setEndDate] = useState(phase?.endDate ?? "");
  const [priceTouched, setPriceTouched] = useState(false);
  const [savedValues, setSavedValues] = useState(() => ({
    phaseType: phase?.phaseType ?? "ACTIVE_TREATMENT",
    title: phase?.title ?? "",
    goals: phase?.goals ?? "",
    notes: phase?.notes ?? "",
    noteByExpert: phase?.noteByExpert ?? "",
    priceVnd: phase ? String(phase.priceVnd) : "",
    startDate: phase?.startDate ?? "",
    endDate: phase?.endDate ?? "",
  }));
  const priceNumber = Number(priceVnd);
  const validPrice =
    priceVnd.trim() !== "" && Number.isInteger(priceNumber) && priceNumber >= 0;
  const validDates = !startDate || !endDate || endDate >= startDate;
  const currentValues = useMemo(
    () => ({
      phaseType,
      title,
      goals,
      notes,
      noteByExpert,
      priceVnd,
      startDate,
      endDate,
    }),
    [
      endDate,
      goals,
      noteByExpert,
      notes,
      phaseType,
      priceVnd,
      startDate,
      title,
    ],
  );
  const dirtyFields = {
    phaseType: currentValues.phaseType !== savedValues.phaseType,
    title: currentValues.title !== savedValues.title,
    goals: currentValues.goals !== savedValues.goals,
    notes: currentValues.notes !== savedValues.notes,
    noteByExpert: currentValues.noteByExpert !== savedValues.noteByExpert,
    priceVnd: currentValues.priceVnd !== savedValues.priceVnd,
    startDate: currentValues.startDate !== savedValues.startDate,
    endDate: currentValues.endDate !== savedValues.endDate,
  };
  const isDirty = Object.values(dirtyFields).some(Boolean);

  useEffect(() => {
    onDirtyChange?.(formKey, isDirty);
  }, [formKey, isDirty, onDirtyChange]);

  useEffect(
    () => () => {
      onDirtyChange?.(formKey, false);
    },
    [formKey, onDirtyChange],
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPriceTouched(true);
    if (!validPrice || !validDates) return;
    try {
      await onSubmit({
        phaseType,
        phaseOrder: phase?.phaseOrder ?? phaseOrder,
        title: title.trim() || null,
        goals: goals.trim() || null,
        notes: notes.trim() || null,
        noteByExpert: noteByExpert.trim() || null,
        priceVnd: priceNumber,
        startDate: startDate || null,
        endDate: endDate || null,
      });
      setSavedValues(currentValues);
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu giai đoạn.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`phase-type-${phase?.id ?? phaseOrder}`}>
            Loại giai đoạn
          </Label>
          <Select
            value={phaseType}
            onValueChange={(value) => setPhaseType(value as TreatmentPhaseType)}
          >
            <SelectTrigger
              id={`phase-type-${phase?.id ?? phaseOrder}`}
              className={cn(
                "w-full",
                dirtyFields.phaseType && "border-amber-400 bg-amber-50/60",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(treatmentPhaseTypeLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tên giai đoạn</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            className={cn(
              dirtyFields.title && "border-amber-400 bg-amber-50/60",
            )}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Mục tiêu</Label>
          <Textarea
            value={goals}
            onChange={(event) => setGoals(event.target.value)}
            rows={2}
            className={cn(
              dirtyFields.goals && "border-amber-400 bg-amber-50/60",
            )}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Lý do chuyên môn dùng trong hồ sơ bệnh án</Label>
          <Textarea
            value={noteByExpert}
            onChange={(event) => setNoteByExpert(event.target.value)}
            rows={3}
            className={cn(
              dirtyFields.noteByExpert && "border-amber-400 bg-amber-50/60",
            )}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Ghi chú vận hành</Label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
            className={cn(
              dirtyFields.notes && "border-amber-400 bg-amber-50/60",
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>Phí giai đoạn (VND)</Label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={priceVnd}
            onChange={(event) => setPriceVnd(event.target.value)}
            onBlur={() => setPriceTouched(true)}
            aria-invalid={priceTouched && !validPrice}
            className={cn(
              dirtyFields.priceVnd && "border-amber-400 bg-amber-50/60",
            )}
          />
          {priceTouched && !validPrice && (
            <p className="text-xs text-red-600">
              Phí phải là số nguyên từ 0 đồng trở lên.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Bắt đầu</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className={cn(
                dirtyFields.startDate && "border-amber-400 bg-amber-50/60",
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Kết thúc</Label>
            <Input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              aria-invalid={!validDates}
              className={cn(
                dirtyFields.endDate && "border-amber-400 bg-amber-50/60",
              )}
            />
            {!validDates && (
              <p className="text-xs text-red-600">
                Ngày kết thúc phải từ ngày bắt đầu trở đi.
              </p>
            )}
          </div>
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
        <Button
          type="submit"
          disabled={isPending || !validPrice || !validDates}
        >
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

function PaidPhaseConfiguration({
  phases,
  onRefresh,
}: {
  phases: TreatmentPhase[];
  onRefresh: () => void;
}) {
  const [selectedPhaseId, setSelectedPhaseId] = useState(
    phases.find((phase) => phase.status === "ACTIVE")?.id ??
      phases[0]?.id ??
      "",
  );
  const phase = phases.find((item) => item.id === selectedPhaseId);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-950">
          Cấu hình giai đoạn sau thanh toán
        </h2>
        <p className="text-xs text-slate-500">
          Chọn hoạt chất, sản phẩm, tạo routine rồi kích hoạt giai đoạn.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {phases.map((item) => (
          <Button
            key={item.id}
            variant={item.id === selectedPhaseId ? "default" : "outline"}
            onClick={() => setSelectedPhaseId(item.id)}
          >
            Giai đoạn {item.phaseOrder + 1}
          </Button>
        ))}
      </div>
      {phase && (
        <PhaseConfiguration
          key={phase.id}
          phase={phase}
          onRefresh={onRefresh}
        />
      )}
    </section>
  );
}

function PhaseConfiguration({
  phase,
  onRefresh,
}: {
  phase: TreatmentPhase;
  onRefresh: () => void;
}) {
  const { data: ingredients = [], isLoading } = useIngredients();
  const candidates = useProductCandidates(phase.id);
  const setIngredientsMutation = useSetPhaseIngredients();
  const setProductsMutation = useSetPhaseProducts();
  const generateMutation = useGenerateRoutine();
  const saveRoutineMutation = useSaveRoutine();
  const updateRoutineMutation = useUpdateRoutine();
  const activateMutation = useActivatePhase();
  const [ingredientIds, setIngredientIds] = useState<string[]>(
    phase.ingredients.map((item) => item.ingredientId),
  );
  const [productIds, setProductIds] = useState<string[]>(
    phase.products.map((item) => item.productVariantId),
  );
  const [routine, setRoutine] = useState<ExpertRoutine | null>(null);

  const busy =
    setIngredientsMutation.isPending ||
    setProductsMutation.isPending ||
    generateMutation.isPending ||
    saveRoutineMutation.isPending ||
    updateRoutineMutation.isPending ||
    activateMutation.isPending;
  const selectedProducts = useMemo(() => new Set(productIds), [productIds]);
  const hasSavedRoutine =
    routine?.status === "ACTIVE" ||
    phase.routines.some((item) => item.status === "ACTIVE");
  const hasDraftRoutine =
    routine?.status === "DRAFT" ||
    phase.routines.some((item) => item.status === "DRAFT");

  async function saveIngredients() {
    try {
      await setIngredientsMutation.mutateAsync({
        phaseId: phase.id,
        ingredientIds,
      });
      toast.success("Đã lưu hoạt chất cho giai đoạn.");
      await candidates.refetch();
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu hoạt chất.",
      );
    }
  }

  async function saveProducts() {
    try {
      await setProductsMutation.mutateAsync({
        phaseId: phase.id,
        productVariantIds: productIds,
      });
      toast.success("Đã lưu sản phẩm cho giai đoạn.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu sản phẩm.",
      );
    }
  }

  async function generateRoutine() {
    try {
      const generatedRoutine = await generateMutation.mutateAsync(phase.id);
      setRoutine(generatedRoutine);
      toast.success("Đã tạo bản nháp routine.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể tạo routine.",
      );
    }
  }

  function updateRoutineStep(
    stepId: string,
    patch: Partial<ExpertRoutineStep>,
  ) {
    setRoutine((current) =>
      current
        ? {
            ...current,
            steps: (current.steps ?? []).map((step) =>
              step.id === stepId ? { ...step, ...patch } : step,
            ),
          }
        : current,
    );
  }

  async function saveRoutine() {
    if (!routine) return;
    if (!routine.title.trim()) {
      toast.error("Tên routine không được để trống.");
      return;
    }
    if ((routine.steps ?? []).some((step) => !step.name.trim())) {
      toast.error("Tên bước routine không được để trống.");
      return;
    }

    try {
      const { routine: updatedRoutine } =
        await updateRoutineMutation.mutateAsync({
          routineId: routine.id,
          treatmentId: phase.treatmentId,
          payload: {
            title: routine.title.trim(),
            description: routine.description?.trim() || null,
            steps: (routine.steps ?? []).map((step) => ({
              name: step.name.trim(),
              period: step.period,
              stepOrder: step.stepOrder,
              instructions: step.instructions?.trim() || null,
              waitMinutes: step.waitMinutes,
              dosageText: step.dosageText?.trim() || null,
            })),
          },
        });
      await saveRoutineMutation.mutateAsync({
        routineId: routine.id,
        treatmentId: phase.treatmentId,
      });
      setRoutine(updatedRoutine);
      toast.success("Đã lưu routine.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu routine.",
      );
    }
  }

  async function activate() {
    try {
      await activateMutation.mutateAsync(phase.id);
      toast.success("Giai đoạn đã được kích hoạt.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể kích hoạt giai đoạn.",
      );
    }
  }

  return (
    <div className="grid gap-5 border bg-white p-5 lg:grid-cols-2">
      <section>
        <h3 className="text-sm font-semibold text-slate-950">
          Hoạt chất chỉ định
        </h3>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto border p-3">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            ingredients.map((ingredient) => (
              <label
                key={ingredient.id}
                className="flex items-center gap-2 text-sm text-slate-700"
              >
                <Checkbox
                  checked={ingredientIds.includes(ingredient.id)}
                  onCheckedChange={(checked) =>
                    setIngredientIds((current) =>
                      checked
                        ? [...new Set([...current, ingredient.id])]
                        : current.filter((id) => id !== ingredient.id),
                    )
                  }
                />
                {ingredient.name}
              </label>
            ))
          )}
        </div>
        <Button
          className="mt-3"
          variant="outline"
          disabled={busy}
          onClick={() => void saveIngredients()}
        >
          <Save className="mr-2 h-4 w-4" /> Lưu hoạt chất
        </Button>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-950">
          Sản phẩm phù hợp
        </h3>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto border p-3">
          {candidates.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : candidates.data?.length ? (
            candidates.data.map((product) => (
              <label
                key={product.productVariantId}
                className="flex items-start gap-2 text-sm text-slate-700"
              >
                <Checkbox
                  checked={selectedProducts.has(product.productVariantId)}
                  onCheckedChange={(checked) =>
                    setProductIds((current) =>
                      checked
                        ? [...new Set([...current, product.productVariantId])]
                        : current.filter(
                            (id) => id !== product.productVariantId,
                          ),
                    )
                  }
                />
                <span>
                  <span className="block font-medium text-slate-900">
                    {product.productName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {product.sku} · match {product.matchScore} · tồn{" "}
                    {product.stockQuantity}
                  </span>
                </span>
              </label>
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Lưu hoạt chất để tải sản phẩm phù hợp.
            </p>
          )}
        </div>
        <Button
          className="mt-3"
          variant="outline"
          disabled={busy}
          onClick={() => void saveProducts()}
        >
          <Save className="mr-2 h-4 w-4" /> Lưu sản phẩm
        </Button>
      </section>

      {routine && (
        <RoutineEditor
          key={routine.id}
          routine={routine}
          disabled={busy || routine.status !== "DRAFT"}
          onRoutineChange={setRoutine}
          onStepChange={updateRoutineStep}
          onSave={() => void saveRoutine()}
        />
      )}

      <div className="flex flex-wrap gap-2 border-t pt-4 lg:col-span-2">
        {!hasSavedRoutine && (
          <Button
            variant="outline"
            disabled={busy || productIds.length === 0}
            onClick={() => void generateRoutine()}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {hasDraftRoutine ? "Tạo lại bản nháp" : "Tạo routine"}
          </Button>
        )}
        {hasSavedRoutine && !routine && (
          <Badge variant="outline" className="h-9 px-3">
            <Check className="mr-2 h-4 w-4 text-emerald-700" /> Routine đã lưu
          </Badge>
        )}
        <Button
          disabled={busy || phase.status === "ACTIVE" || hasDraftRoutine}
          onClick={() => void activate()}
        >
          <Check className="mr-2 h-4 w-4" /> Kích hoạt giai đoạn
        </Button>
      </div>
    </div>
  );
}

function RoutineEditor({
  routine,
  disabled,
  onRoutineChange,
  onStepChange,
  onSave,
}: {
  routine: ExpertRoutine;
  disabled: boolean;
  onRoutineChange: (routine: ExpertRoutine) => void;
  onStepChange: (stepId: string, patch: Partial<ExpertRoutineStep>) => void;
  onSave: () => void;
}) {
  const steps = routine.steps ?? [];
  const initialPeriod: RoutinePeriod = steps.some(
    (step) => step.period === "MORNING",
  )
    ? "MORNING"
    : "EVENING";

  return (
    <section className="space-y-5 border-t pt-5 lg:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">
              Routine điều trị
            </h3>
            <Badge variant="outline">
              {routine.status === "DRAFT" ? "Bản nháp" : "Đã lưu"}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {steps.length} bước · sáng và tối
          </p>
        </div>
        <Button disabled={disabled} onClick={onSave}>
          <Save className="mr-2 h-4 w-4" /> Lưu routine
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`routine-title-${routine.id}`}>Tên routine</Label>
          <Input
            id={`routine-title-${routine.id}`}
            value={routine.title}
            disabled={disabled}
            onChange={(event) =>
              onRoutineChange({ ...routine, title: event.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`routine-description-${routine.id}`}>Mô tả</Label>
          <Textarea
            id={`routine-description-${routine.id}`}
            value={routine.description ?? ""}
            disabled={disabled}
            rows={2}
            onChange={(event) =>
              onRoutineChange({
                ...routine,
                description: event.target.value || null,
              })
            }
          />
        </div>
      </div>

      <Tabs defaultValue={initialPeriod}>
        <TabsList>
          <TabsTrigger value="MORNING">
            <Sun className="mr-2 h-4 w-4" /> Buổi sáng
          </TabsTrigger>
          <TabsTrigger value="EVENING">
            <Moon className="mr-2 h-4 w-4" /> Buổi tối
          </TabsTrigger>
        </TabsList>
        {(["MORNING", "EVENING"] as const).map((period) => {
          const periodSteps = steps
            .filter((step) => step.period === period)
            .sort((left, right) => left.stepOrder - right.stepOrder);

          return (
            <TabsContent key={period} value={period} className="space-y-3">
              {periodSteps.length ? (
                periodSteps.map((step, index) => (
                  <RoutineStepEditor
                    key={step.id}
                    step={step}
                    displayOrder={index + 1}
                    disabled={disabled}
                    onChange={(patch) => onStepChange(step.id, patch)}
                  />
                ))
              ) : (
                <div className="border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                  Chưa có bước cho buổi {period === "MORNING" ? "sáng" : "tối"}.
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}

function RoutineStepEditor({
  step,
  displayOrder,
  disabled,
  onChange,
}: {
  step: ExpertRoutineStep;
  displayOrder: number;
  disabled: boolean;
  onChange: (patch: Partial<ExpertRoutineStep>) => void;
}) {
  const sku = step.details?.[0]?.productVariant?.sku;

  return (
    <div className="border p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Bước {displayOrder}</Badge>
        {sku && <span className="text-xs text-slate-500">{sku}</span>}
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        <div className="space-y-2 md:col-span-4">
          <Label htmlFor={`routine-step-name-${step.id}`}>Tên bước</Label>
          <Input
            id={`routine-step-name-${step.id}`}
            value={step.name}
            disabled={disabled}
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Thời điểm</Label>
          <Select
            value={step.period}
            disabled={disabled}
            onValueChange={(value) => {
              if (value) onChange({ period: value });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MORNING">Buổi sáng</SelectItem>
              <SelectItem value="EVENING">Buổi tối</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor={`routine-step-dosage-${step.id}`}>Liều lượng</Label>
          <Input
            id={`routine-step-dosage-${step.id}`}
            value={step.dosageText ?? ""}
            disabled={disabled}
            placeholder="Ví dụ: 2 lần nhấn"
            onChange={(event) =>
              onChange({ dosageText: event.target.value || null })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-3">
          <Label htmlFor={`routine-step-wait-${step.id}`}>
            Chờ trước bước tiếp theo (phút)
          </Label>
          <Input
            id={`routine-step-wait-${step.id}`}
            type="number"
            min={0}
            value={step.waitMinutes ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                waitMinutes:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2 md:col-span-6">
          <Label htmlFor={`routine-step-instructions-${step.id}`}>
            Hướng dẫn sử dụng
          </Label>
          <Textarea
            id={`routine-step-instructions-${step.id}`}
            value={step.instructions ?? ""}
            disabled={disabled}
            rows={2}
            onChange={(event) =>
              onChange({ instructions: event.target.value || null })
            }
          />
        </div>
      </div>
    </div>
  );
}
