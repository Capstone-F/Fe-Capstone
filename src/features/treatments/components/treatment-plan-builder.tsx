"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
} from "../hooks/useTreatments";
import type {
  ExpertRoutine,
  ExpertRoutineStep,
  RoutinePeriod,
  TreatmentChart,
  TreatmentPhase,
  TreatmentPhasePayload,
  TreatmentPlan,
  TreatmentProductConflict,
} from "../types/treatment.types";
import {
  CandidateConflictBadge,
  PhaseProductConflictAlert,
} from "./product-conflict-warning";
import {
  getTreatmentStatusLabel,
  treatmentPhaseStatusLabel,
  treatmentPhaseTypeLabel,
} from "../lib/treatment-labels";
import {
  createTreatmentPhaseFormSchema,
  createTreatmentPlanSchema,
  getNextDay,
  getPreviousDay,
  routineSchema,
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

export interface TreatmentPlanBuilderProps {
  initialTreatmentId?: string;
  initialCustomerId?: string | null;
  initialCustomerName?: string;
  initialSourceConsultationId?: string | null;
  isDrawer?: boolean;
  onClose?: () => void;
  onPlanCreated?: (plan: TreatmentPlan) => void;
}

export function TreatmentPlanBuilder({
  initialTreatmentId,
  initialCustomerId,
  initialCustomerName,
  initialSourceConsultationId,
  isDrawer = false,
  onPlanCreated,
}: TreatmentPlanBuilderProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localTreatmentId, setLocalTreatmentId] = useState<string | undefined>(
    initialTreatmentId,
  );

  useEffect(() => {
    if (initialTreatmentId !== undefined) {
      const timer = setTimeout(() => {
        setLocalTreatmentId(initialTreatmentId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialTreatmentId]);

  const urlTreatmentId = searchParams.get("treatmentId") ?? "";
  const treatmentId = isDrawer ? (localTreatmentId ?? "") : urlTreatmentId;
  const customerId = isDrawer
    ? (initialCustomerId ?? null)
    : searchParams.get("customerId");
  const customerName = isDrawer
    ? (initialCustomerName ?? "")
    : searchParams.get("customerName") || "";
  const sourceConsultationId = isDrawer
    ? (initialSourceConsultationId ?? null)
    : searchParams.get("sourceConsultationId");

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

  const paidToastShownRef = useRef(false);
  useEffect(() => {
    if (detail.data?.paidAt && !paidToastShownRef.current) {
      paidToastShownRef.current = true;
      toast.success("Khách hàng đã thanh toán phác đồ điều trị thành công!");
    }
  }, [detail.data?.paidAt]);

  useEffect(() => {
    if (treatmentId || !existingPlan) return;
    if (isDrawer) {
      const timer = setTimeout(() => {
        setLocalTreatmentId(existingPlan.id);
      }, 0);
      return () => clearTimeout(timer);
    }
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
  }, [
    customerName,
    existingPlan,
    isDrawer,
    router,
    sourceConsultationId,
    treatmentId,
  ]);

  if (!treatmentId) {
    if (customerId && (existingPlans.isLoading || existingPlan)) {
      return (
        <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang kiểm tra phác
          đồ hiện có...
        </div>
      );
    }

    if (customerId && existingPlans.isError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 p-6 text-center">
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
        isDrawer={isDrawer}
        onCreate={async (payload) => {
          const plan = await createMutation.mutateAsync(payload);
          if (isDrawer) {
            setLocalTreatmentId(plan.id);
            onPlanCreated?.(plan);
          } else {
            const query = new URLSearchParams({
              treatmentId: plan.id,
              customerId: plan.customerId,
              customerName,
            });
            if (plan.sourceConsultationId) {
              query.set("sourceConsultationId", plan.sourceConsultationId);
            }
            router.replace(`/expert/treatments/builder?${query.toString()}`);
          }
        }}
      />
    );
  }

  if (detail.isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải phác đồ...
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center">
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
    <div
      className={cn("min-h-full", isDrawer ? "bg-transparent" : "bg-slate-50")}
    >
      {!isDrawer && (
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
                  <Badge variant="outline">
                    {getTreatmentStatusLabel(plan)}
                  </Badge>
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
      )}

      {isDrawer && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-950">
                {plan.title}
              </h2>
              <Badge variant="outline">{getTreatmentStatusLabel(plan)}</Badge>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {customerName} · {plan.phases.length} giai đoạn ·{" "}
              <span className="font-semibold text-emerald-600">
                {formatVnd(plan.totalPriceVnd ?? 0)}
              </span>
            </p>
          </div>
        </div>
      )}

      <main
        className={cn(
          isDrawer ? "space-y-4" : "mx-auto max-w-6xl space-y-6 p-4 sm:p-6",
        )}
      >
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
  isDrawer = false,
  onCreate,
}: {
  customerId: string | null;
  customerName: string;
  sourceConsultationId: string | null;
  isPending: boolean;
  isDrawer?: boolean;
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
    <div className={cn(isDrawer ? "w-full" : "mx-auto max-w-3xl p-4 sm:p-6")}>
      {!isDrawer && (
        <Button variant="ghost" onClick={() => router.push("/expert")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      )}
      <div
        className={cn(
          isDrawer
            ? "space-y-4"
            : "mt-4 rounded-2xl border bg-white p-5 shadow-xs sm:p-7",
        )}
      >
        {!isDrawer && (
          <div className="border-b pb-4">
            <h1 className="text-lg font-semibold text-slate-950">
              Tạo phác đồ cho {customerName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Khởi tạo bản nháp từ ca tư vấn hiện tại.
            </p>
          </div>
        )}

        {!validSource ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Thiếu customer hoặc source consultation hợp lệ. Hãy mở thao tác này
            từ ca tư vấn đang diễn ra hoặc đã hoàn thành.
          </p>
        ) : (
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
            noValidate
          >
            <FormController
              control={form.control}
              name="title"
              label="Tên phác đồ *"
            >
              {(field) => (
                <Input
                  {...field}
                  id={field.name}
                  maxLength={200}
                  placeholder="VD: Phác đồ điều trị mụn viêm & phục hồi da"
                  className="rounded-xl text-sm"
                  aria-invalid={Boolean(form.formState.errors.title)}
                />
              )}
            </FormController>
            <FormController
              control={form.control}
              name="description"
              label="Tóm tắt đánh giá lâm sàng"
            >
              {(field) => (
                <Textarea
                  {...field}
                  id={field.name}
                  maxLength={2000}
                  rows={3}
                  placeholder="Ghi chú đánh giá tình trạng da, tiền sử kích ứng, mục tiêu điều trị..."
                  className="rounded-xl text-sm"
                  aria-invalid={Boolean(form.formState.errors.description)}
                />
              )}
            </FormController>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormController
                control={form.control}
                name="startDate"
                label="Ngày bắt đầu *"
              >
                {(field) => (
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    className="rounded-xl text-sm"
                    aria-invalid={Boolean(form.formState.errors.startDate)}
                  />
                )}
              </FormController>
              <FormController
                control={form.control}
                name="endDate"
                label="Ngày kết thúc *"
              >
                {(field) => (
                  <Input
                    {...field}
                    id={field.name}
                    type="date"
                    min={startDate}
                    className="rounded-xl text-sm"
                    aria-invalid={Boolean(form.formState.errors.endDate)}
                  />
                )}
              </FormController>
            </div>
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-indigo-600 px-6 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Tạo bản nháp phác đồ
              </Button>
            </div>
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

  const sortedPhases = useMemo(
    () => [...phases].sort((a, b) => a.phaseOrder - b.phaseOrder),
    [phases],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Các giai đoạn điều trị ({sortedPhases.length})
          </h2>
          <p className="text-xs text-slate-500">
            Tổng phí các giai đoạn: {formatVnd(totalPhasePrice)}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm giai đoạn
        </Button>
      </div>

      {sortedPhases.length > 0 && (
        <Accordion
          multiple
          defaultValue={defaultOpenPhases}
          className="overflow-hidden border bg-white"
        >
          {sortedPhases.map((phase, idx) => {
            const prevPhase = idx > 0 ? sortedPhases[idx - 1] : undefined;
            const nextPhase =
              idx < sortedPhases.length - 1 ? sortedPhases[idx + 1] : undefined;
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
                          {phase.startDate && phase.endDate && (
                            <span className="ml-2 text-slate-400">
                              ({phase.startDate} → {phase.endDate})
                            </span>
                          )}
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
                    phaseOrder={phase.phaseOrder}
                    minStartDate={
                      prevPhase?.endDate
                        ? getNextDay(prevPhase.endDate)
                        : plan.startDate || undefined
                    }
                    maxEndDate={
                      nextPhase?.startDate
                        ? getPreviousDay(nextPhase.startDate)
                        : plan.endDate || undefined
                    }
                    previousPhaseInfo={
                      prevPhase?.endDate
                        ? {
                            order: prevPhase.phaseOrder + 1,
                            endDate: prevPhase.endDate,
                          }
                        : undefined
                    }
                    nextPhaseInfo={
                      nextPhase?.startDate
                        ? {
                            order: nextPhase.phaseOrder + 1,
                            startDate: nextPhase.startDate,
                          }
                        : undefined
                    }
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
            {(() => {
              const lastPhase =
                sortedPhases.length > 0
                  ? sortedPhases[sortedPhases.length - 1]
                  : undefined;
              const nextAvailableStartDate = lastPhase?.endDate
                ? getNextDay(lastPhase.endDate)
                : plan.startDate || undefined;
              return (
                <PhaseForm
                  formKey="new-phase"
                  phaseOrder={
                    phases.length
                      ? Math.max(...phases.map((phase) => phase.phaseOrder)) + 1
                      : 0
                  }
                  minStartDate={nextAvailableStartDate}
                  maxEndDate={plan.endDate || undefined}
                  previousPhaseInfo={
                    lastPhase?.endDate
                      ? {
                          order: lastPhase.phaseOrder + 1,
                          endDate: lastPhase.endDate,
                        }
                      : undefined
                  }
                  defaultStartDate={nextAvailableStartDate || ""}
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
              );
            })()}
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
  minStartDate,
  maxEndDate,
  previousPhaseInfo,
  nextPhaseInfo,
  defaultStartDate,
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
  minStartDate?: string;
  maxEndDate?: string;
  previousPhaseInfo?: { order: number; endDate: string };
  nextPhaseInfo?: { order: number; startDate: string };
  defaultStartDate?: string;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: TreatmentPhasePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
  onDirtyChange?: (formKey: string, dirty: boolean) => void;
}) {
  const form = useForm<TreatmentPhaseFormValues>({
    resolver: zodResolver(
      createTreatmentPhaseFormSchema({
        minStartDate,
        maxEndDate,
        previousPhaseInfo,
        nextPhaseInfo,
      }),
    ),
    defaultValues: {
      phaseType: phase?.phaseType ?? "ACTIVE_TREATMENT",
      title: phase?.title ?? "",
      goals: phase?.goals ?? "",
      notes: phase?.notes ?? "",
      noteByExpert: phase?.noteByExpert ?? "",
      priceVnd: phase ? String(phase.priceVnd) : "",
      startDate: phase?.startDate ?? defaultStartDate ?? minStartDate ?? "",
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
            description={
              previousPhaseInfo
                ? `Sau Giai đoạn ${previousPhaseInfo.order} (từ ngày ${minStartDate})`
                : undefined
            }
          >
            {(field) => (
              <Input
                {...field}
                id={field.name}
                type="date"
                min={minStartDate}
                max={maxEndDate}
                className={cn(
                  dirtyFields.startDate && "border-amber-400 bg-amber-50/60",
                )}
                aria-invalid={Boolean(form.formState.errors.startDate)}
              />
            )}
          </FormController>
          <FormController
            control={form.control}
            name="endDate"
            label="Kết thúc"
            description={
              nextPhaseInfo
                ? `Trước Giai đoạn ${nextPhaseInfo.order} (đến ngày ${maxEndDate})`
                : undefined
            }
          >
            {(field) => (
              <Input
                {...field}
                id={field.name}
                type="date"
                min={startDate || minStartDate}
                max={maxEndDate}
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
  const [persistedRoutine, setPersistedRoutine] =
    useState<ExpertRoutine | null>(null);
  const [productConflicts, setProductConflicts] = useState<
    TreatmentProductConflict[]
  >([]);

  const busy =
    setIngredientsMutation.isPending ||
    setProductsMutation.isPending ||
    generateMutation.isPending ||
    saveRoutineMutation.isPending ||
    updateRoutineMutation.isPending ||
    activateMutation.isPending;
  const selectedProducts = useMemo(() => new Set(productIds), [productIds]);
  const savedPhaseProducts = useMemo(() => {
    return phase.products.map((p) => {
      const candidate = candidates.data?.find(
        (c) => c.productVariantId === p.productVariantId,
      );
      return {
        productVariantId: p.productVariantId,
        sku: candidate?.sku || p.productVariantId.slice(0, 8),
        productName: candidate?.productName || "Sản phẩm chỉ định",
      };
    });
  }, [phase.products, candidates.data]);

  const resolveProductName = useCallback(
    (variantId: string) => {
      const candidate = candidates.data?.find(
        (item) => item.productVariantId === variantId,
      );
      if (candidate) return candidate.productName;
      const selectedProduct = phase.products.find(
        (item) => item.productVariantId === variantId,
      );
      return (
        selectedProduct?.productName || `Sản phẩm ${variantId.slice(0, 8)}`
      );
    },
    [candidates.data, phase.products],
  );

  const hasSavedRoutine =
    routine?.status === "ACTIVE" ||
    phase.routines.some((item) => item.status === "ACTIVE");
  const savedRoutineSummary = phase.routines.find(
    (item) => item.status === "ACTIVE",
  );
  const hasDraftRoutine =
    routine?.status === "DRAFT" ||
    phase.routines.some((item) => item.status === "DRAFT");

  const hasUnsavedRoutineChanges =
    routine !== null &&
    (routine.status === "DRAFT" ||
      JSON.stringify(routine) !== JSON.stringify(persistedRoutine));

  const canActivate =
    phase.status !== "ACTIVE" &&
    hasSavedRoutine &&
    !hasUnsavedRoutineChanges &&
    !busy;

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
      const updatedPhase = await setProductsMutation.mutateAsync({
        phaseId: phase.id,
        productVariantIds: productIds,
      });
      setProductConflicts(updatedPhase.conflicts ?? []);
      toast.success("Đã lưu sản phẩm cho giai đoạn.");
      await candidates.refetch();
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
      setPersistedRoutine(generatedRoutine);
      toast.success("Đã tạo bản nháp routine.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể tạo routine.",
      );
    }
  }

  async function loadSavedRoutine() {
    if (!savedRoutineSummary) return;
    try {
      const { routine: serverRoutine } =
        await updateRoutineMutation.mutateAsync({
          routineId: savedRoutineSummary.id,
          treatmentId: phase.treatmentId,
          payload: {},
        });
      setRoutine(serverRoutine);
      setPersistedRoutine(serverRoutine);
    } catch (reason) {
      toast.error(
        reason instanceof Error
          ? reason.message
          : "Không thể tải routine đã lưu.",
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

  function addRoutineStep(period: RoutinePeriod) {
    setRoutine((current) => {
      if (!current) return current;
      const steps = current.steps ?? [];
      const stepOrder =
        steps
          .filter((step) => step.period === period)
          .reduce((maximum, step) => Math.max(maximum, step.stepOrder), -1) + 1;
      const now = new Date().toISOString();
      const firstProduct = savedPhaseProducts[0];
      return {
        ...current,
        steps: [
          ...steps,
          {
            id: `new-${crypto.randomUUID()}`,
            routineId: current.id,
            name: firstProduct ? firstProduct.productName : "",
            period,
            stepOrder,
            instructions: null,
            waitMinutes: null,
            dosageText: null,
            details: firstProduct
              ? [
                  {
                    id: `new-detail-${crypto.randomUUID()}`,
                    routineStepId: `new-${crypto.randomUUID()}`,
                    productVariantId: firstProduct.productVariantId,
                    amountMl: null,
                    date: null,
                    period,
                    progressNote: null,
                    productVariant: {
                      id: firstProduct.productVariantId,
                      sku: firstProduct.sku,
                    },
                  },
                ]
              : [],
            createdAt: now,
            updatedAt: now,
          },
        ],
      };
    });
  }

  function deleteRoutineStep(stepId: string) {
    setRoutine((current) =>
      current
        ? {
            ...current,
            steps: (current.steps ?? []).filter((step) => step.id !== stepId),
          }
        : current,
    );
  }

  async function saveRoutine() {
    if (!routine) return;

    const missingProductStep = (routine.steps ?? []).find(
      (step) => !step.details?.[0]?.productVariantId,
    );
    if (missingProductStep) {
      toast.error(
        `Bước "${missingProductStep.name || "chưa đặt tên"}" chưa được chọn sản phẩm. Vui lòng chọn sản phẩm cho từng bước.`,
      );
      return;
    }

    const parsed = routineSchema.safeParse({
      title: routine.title,
      description: routine.description ?? "",
      steps: (routine.steps ?? []).map((step) => ({
        name: step.name,
        period: step.period,
        instructions: step.instructions ?? "",
        dosageText: step.dosageText ?? "",
        waitMinutes: step.waitMinutes,
      })),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Routine chưa hợp lệ.");
      return;
    }

    try {
      const requestedSteps = routine.steps ?? [];
      const { routine: updatedRoutine } =
        await updateRoutineMutation.mutateAsync({
          routineId: routine.id,
          treatmentId: phase.treatmentId,
          payload: {
            title: routine.title.trim(),
            description: routine.description?.trim() || null,
            steps: requestedSteps.map((step, index) => ({
              id: isUuid(step.id) ? step.id : undefined,
              name: step.name.trim(),
              period: step.period,
              stepOrder: index,
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
      setPersistedRoutine(updatedRoutine);
      toast.success("Đã lưu routine thành công!");
      onRefresh();
    } catch (reason) {
      setRoutine(persistedRoutine);
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
      <PhaseProductConflictAlert
        conflicts={productConflicts}
        resolveProductName={resolveProductName}
      />
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
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">
                      {product.productName}
                    </span>
                    <CandidateConflictBadge
                      warnings={product.conflictWarnings ?? []}
                      resolveProductName={resolveProductName}
                    />
                  </span>
                  <span className="text-xs text-slate-500">
                    {product.sku} · tồn {product.stockQuantity}
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
          availableProducts={savedPhaseProducts}
          disabled={busy}
          onRoutineChange={setRoutine}
          onStepChange={updateRoutineStep}
          onAddStep={addRoutineStep}
          onDeleteStep={deleteRoutineStep}
          onSave={() => void saveRoutine()}
        />
      )}

      <div className="flex flex-col gap-3 border-t pt-4 lg:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          {!hasSavedRoutine && (
            <Button
              variant="outline"
              disabled={busy || productIds.length === 0}
              onClick={() => void generateRoutine()}
            >
              <Plus className="mr-2 h-4 w-4" />
              {hasDraftRoutine ? "Tạo lại bản nháp" : "Tạo routine"}
            </Button>
          )}
          {hasSavedRoutine && !routine && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => void loadSavedRoutine()}
            >
              <Check className="mr-2 h-4 w-4 text-emerald-700" /> Mở routine đã
              lưu
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function RoutineEditor({
  routine,
  availableProducts,
  disabled,
  onRoutineChange,
  onStepChange,
  onAddStep,
  onDeleteStep,
  onSave,
}: {
  routine: ExpertRoutine;
  availableProducts: Array<{
    productVariantId: string;
    sku: string;
    productName: string;
  }>;
  disabled: boolean;
  onRoutineChange: (routine: ExpertRoutine) => void;
  onStepChange: (stepId: string, patch: Partial<ExpertRoutineStep>) => void;
  onAddStep: (period: RoutinePeriod) => void;
  onDeleteStep: (stepId: string) => void;
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
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => onAddStep(period)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Thêm bước
                  {period === "MORNING" ? " buổi sáng" : " buổi tối"}
                </Button>
              </div>
              {periodSteps.length ? (
                periodSteps.map((step, index) => (
                  <RoutineStepEditor
                    key={step.id}
                    step={step}
                    displayOrder={index + 1}
                    availableProducts={availableProducts}
                    disabled={disabled}
                    onChange={(patch) => onStepChange(step.id, patch)}
                    onDelete={() => onDeleteStep(step.id)}
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
  availableProducts,
  disabled,
  onChange,
  onDelete,
}: {
  step: ExpertRoutineStep;
  displayOrder: number;
  availableProducts: Array<{
    productVariantId: string;
    sku: string;
    productName: string;
  }>;
  disabled: boolean;
  onChange: (patch: Partial<ExpertRoutineStep>) => void;
  onDelete: () => void;
}) {
  const currentVariantId = step.details?.[0]?.productVariantId;
  const matchedProduct = availableProducts.find(
    (p) => p.productVariantId === currentVariantId,
  );
  const sku = matchedProduct?.sku || step.details?.[0]?.productVariant?.sku;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs font-semibold">
            Bước {displayOrder}
          </Badge>
          {sku ? (
            <Badge
              variant="outline"
              className="border-indigo-200 bg-indigo-50 font-mono text-xs font-semibold text-indigo-700"
            >
              {sku}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-xs text-amber-700"
            >
              Chưa chọn sản phẩm
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={onDelete}
          className="h-8 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Xóa bước
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        {/* Product selector */}
        <div className="space-y-1.5 md:col-span-6">
          <Label className="text-xs font-semibold text-slate-900">
            Sản phẩm đã lưu trong giai đoạn *
          </Label>
          <Select
            value={currentVariantId || ""}
            disabled={disabled}
            onValueChange={(selectedId) => {
              if (!selectedId) return;
              const product = availableProducts.find(
                (p) => p.productVariantId === selectedId,
              );
              if (!product) return;
              onChange({
                name:
                  !step.name || step.name === "Bước mới"
                    ? product.productName
                    : step.name,
                details: [
                  {
                    id:
                      step.details?.[0]?.id || `detail-${crypto.randomUUID()}`,
                    routineStepId: step.id,
                    productVariantId: selectedId,
                    amountMl: null,
                    date: null,
                    period: step.period,
                    progressNote: null,
                    productVariant: {
                      id: selectedId,
                      sku: product.sku,
                    },
                  },
                ],
              });
            }}
          >
            <SelectTrigger
              className={cn(
                "w-full",
                !currentVariantId && "border-amber-400 bg-amber-50/60",
              )}
            >
              <SelectValue placeholder="-- Chọn sản phẩm cho bước này --">
                {matchedProduct
                  ? `[${matchedProduct.sku}] ${matchedProduct.productName}`
                  : "-- Chọn sản phẩm đã lưu cho bước này --"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableProducts.length > 0 ? (
                availableProducts.map((product) => (
                  <SelectItem
                    key={product.productVariantId}
                    value={product.productVariantId}
                  >
                    <span className="font-mono font-semibold text-indigo-600">
                      [{product.sku}]
                    </span>{" "}
                    <span>{product.productName}</span>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  Chưa có sản phẩm nào được lưu ở giai đoạn này
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {!currentVariantId && (
            <p className="text-[11px] font-medium text-amber-600">
              * Vui lòng chọn sản phẩm áp dụng cho bước này.
            </p>
          )}
        </div>

        <div className="space-y-1.5 md:col-span-6">
          <Label
            htmlFor={`routine-step-name-${step.id}`}
            className="text-xs font-semibold"
          >
            Tên bước
          </Label>
          <Input
            id={`routine-step-name-${step.id}`}
            value={step.name}
            disabled={disabled}
            placeholder="Ví dụ: Thoa serum phục hồi"
            onChange={(event) => onChange({ name: event.target.value })}
          />
        </div>

        <div className="space-y-1.5 md:col-span-3">
          <Label
            htmlFor={`routine-step-dosage-${step.id}`}
            className="text-xs font-semibold"
          >
            Liều lượng
          </Label>
          <Input
            id={`routine-step-dosage-${step.id}`}
            value={step.dosageText ?? ""}
            disabled={disabled}
            placeholder="Ví dụ: 2 lần nhấn / 3-4 giọt"
            onChange={(event) =>
              onChange({ dosageText: event.target.value || null })
            }
          />
        </div>

        <div className="space-y-1.5 md:col-span-3">
          <Label
            htmlFor={`routine-step-wait-${step.id}`}
            className="text-xs font-semibold"
          >
            Chờ trước bước tiếp theo (phút)
          </Label>
          <Input
            id={`routine-step-wait-${step.id}`}
            type="number"
            min={0}
            value={step.waitMinutes ?? ""}
            disabled={disabled}
            placeholder="0"
            onChange={(event) =>
              onChange({
                waitMinutes:
                  event.target.value === "" ? null : Number(event.target.value),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
