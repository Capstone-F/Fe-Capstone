"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  CalendarCheck,
  Camera,
  Check,
  ClipboardCheck,
  Loader2,
  PackageCheck,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
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
import { formatVnd } from "@/shared/utils/format";
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
  useUpdatePhase,
} from "../hooks/useTreatments";
import type {
  TreatmentChart,
  TreatmentPhase,
  TreatmentPhasePayload,
  TreatmentPhaseType,
} from "../types/treatment.types";

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

const phaseTypeLabel: Record<TreatmentPhaseType, string> = {
  INITIAL_ASSESSMENT: "Đánh giá ban đầu",
  ACTIVE_TREATMENT: "Điều trị tích cực",
  MAINTENANCE: "Duy trì",
  RECOVERY: "Phục hồi",
};

export function TreatmentPlanBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const treatmentId = searchParams.get("treatmentId") ?? "";
  const customerId = searchParams.get("customerId");
  const customerName = searchParams.get("customerName") || "Khách hàng";
  const sourceConsultationId = searchParams.get("sourceConsultationId");
  const detail = useTreatmentPlanDetail(treatmentId);
  const createMutation = useCreateTreatmentPlan();

  if (!treatmentId) {
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
                <Badge variant="outline">{plan.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {customerName} · {plan.phases.length} phase ·{" "}
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
            treatmentId={plan.id}
            phases={plan.phases}
            readyForPayment={plan.readyForPayment}
            onRefresh={() => void detail.refetch()}
          />
        ) : plan.status === "ACTIVE" ? (
          <PaidPhaseConfiguration
            phases={plan.phases}
            onRefresh={() => void detail.refetch()}
          />
        ) : (
          <div className="border bg-white p-5 text-sm text-slate-600">
            Phác đồ đang ở trạng thái {plan.status.toLowerCase()} và không thể
            chỉnh sửa phase.
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
        Ghi chú theo phase
      </h3>
      <div className="mt-3 space-y-3">
        {chart.phases.map((phase) => (
          <article
            key={phase.id}
            className="border-l-2 border-emerald-600 pl-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-900">
                Phase {phase.phaseOrder + 1}: {phase.title || "Chưa đặt tên"}
              </p>
              <Badge variant="outline">{phase.status}</Badge>
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

function DraftPhaseEditor({
  treatmentId,
  phases,
  readyForPayment,
  onRefresh,
}: {
  treatmentId: string;
  phases: TreatmentPhase[];
  readyForPayment: boolean;
  onRefresh: () => void;
}) {
  const addMutation = useAddPhase();
  const updateMutation = useUpdatePhase();
  const deleteMutation = useDeletePhase();
  const submitMutation = useSubmitPlan();
  const [showNew, setShowNew] = useState(phases.length === 0);

  async function submitForPayment() {
    try {
      await submitMutation.mutateAsync(treatmentId);
      toast.success(
        "Phác đồ đã qua kiểm tra và sẵn sàng để khách hàng thanh toán.",
      );
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể gửi phác đồ.",
      );
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Các phase điều trị
          </h2>
          <p className="text-xs text-slate-500">
            Mỗi phase phải có lý do chuyên môn trước khi gửi thanh toán.
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm phase
        </Button>
      </div>

      {phases.map((phase) => (
        <PhaseForm
          key={`${phase.id}:${phase.ingredients.map((item) => item.ingredientId).join(",")}:${phase.products.map((item) => item.productVariantId).join(",")}`}
          phase={phase}
          submitLabel="Lưu phase"
          isPending={updateMutation.isPending || deleteMutation.isPending}
          onSubmit={async (payload) => {
            await updateMutation.mutateAsync({
              phaseId: phase.id,
              treatmentId,
              payload,
            });
            toast.success(`Đã lưu phase ${phase.phaseOrder + 1}.`);
            onRefresh();
          }}
          onDelete={async () => {
            await deleteMutation.mutateAsync({
              phaseId: phase.id,
              treatmentId,
            });
            toast.success("Đã xóa phase.");
            onRefresh();
          }}
        />
      ))}

      {showNew && (
        <PhaseForm
          phaseOrder={
            phases.length
              ? Math.max(...phases.map((phase) => phase.phaseOrder)) + 1
              : 0
          }
          submitLabel="Tạo phase"
          isPending={addMutation.isPending}
          onCancel={() => setShowNew(false)}
          onSubmit={async (payload) => {
            await addMutation.mutateAsync({ treatmentId, payload });
            toast.success("Đã thêm phase.");
            setShowNew(false);
            onRefresh();
          }}
        />
      )}

      <div className="flex flex-col gap-3 border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Kiểm tra trước thanh toán
          </p>
          <p className="text-xs text-slate-500">
            Cần ngày điều trị, ít nhất một phase, tổng phí lớn hơn 0 và note
            chuyên môn cho mọi phase.
          </p>
        </div>
        <Button
          disabled={!readyForPayment || submitMutation.isPending}
          onClick={() => void submitForPayment()}
        >
          {submitMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ClipboardCheck className="mr-2 h-4 w-4" />
          )}
          Gửi khách hàng thanh toán
        </Button>
      </div>
    </section>
  );
}

function PhaseForm({
  phase,
  phaseOrder = 0,
  submitLabel,
  isPending,
  onSubmit,
  onDelete,
  onCancel,
}: {
  phase?: TreatmentPhase;
  phaseOrder?: number;
  submitLabel: string;
  isPending: boolean;
  onSubmit: (payload: TreatmentPhasePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel?: () => void;
}) {
  const [phaseType, setPhaseType] = useState<TreatmentPhaseType>(
    phase?.phaseType ?? "ACTIVE_TREATMENT",
  );
  const [title, setTitle] = useState(phase?.title ?? "");
  const [goals, setGoals] = useState(phase?.goals ?? "");
  const [notes, setNotes] = useState(phase?.notes ?? "");
  const [noteByExpert, setNoteByExpert] = useState(phase?.noteByExpert ?? "");
  const [priceVnd, setPriceVnd] = useState(phase?.priceVnd ?? 0);
  const [startDate, setStartDate] = useState(phase?.startDate ?? "");
  const [endDate, setEndDate] = useState(phase?.endDate ?? "");
  const validPrice = Number.isInteger(priceVnd) && priceVnd >= 0;
  const validDates = !startDate || !endDate || endDate >= startDate;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validPrice || !validDates) return;
    try {
      await onSubmit({
        phaseType,
        phaseOrder: phase?.phaseOrder ?? phaseOrder,
        title: title.trim() || null,
        goals: goals.trim() || null,
        notes: notes.trim() || null,
        noteByExpert: noteByExpert.trim() || null,
        priceVnd,
        startDate: startDate || null,
        endDate: endDate || null,
      });
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu phase.",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">
          Phase {(phase?.phaseOrder ?? phaseOrder) + 1}
        </h3>
        <Badge variant="outline">{phase ? phase.status : "Mới"}</Badge>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`phase-type-${phase?.id ?? phaseOrder}`}>
            Loại phase
          </Label>
          <Select
            value={phaseType}
            onValueChange={(value) => setPhaseType(value as TreatmentPhaseType)}
          >
            <SelectTrigger
              id={`phase-type-${phase?.id ?? phaseOrder}`}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(phaseTypeLabel).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tên phase</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Mục tiêu</Label>
          <Textarea
            value={goals}
            onChange={(event) => setGoals(event.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Lý do chuyên môn dùng trong hồ sơ bệnh án</Label>
          <Textarea
            value={noteByExpert}
            onChange={(event) => setNoteByExpert(event.target.value)}
            rows={3}
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Ghi chú vận hành</Label>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Phí phase (VND)</Label>
          <Input
            type="number"
            min={0}
            step={1000}
            value={priceVnd}
            onChange={(event) => setPriceVnd(Number(event.target.value))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Bắt đầu</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
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
          disabled={
            isPending ||
            !title.trim() ||
            !noteByExpert.trim() ||
            !validPrice ||
            !validDates
          }
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
          Cấu hình phase sau thanh toán
        </h2>
        <p className="text-xs text-slate-500">
          Chọn hoạt chất, sản phẩm, tạo routine rồi kích hoạt phase.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {phases.map((item) => (
          <Button
            key={item.id}
            variant={item.id === selectedPhaseId ? "default" : "outline"}
            onClick={() => setSelectedPhaseId(item.id)}
          >
            Phase {item.phaseOrder + 1}
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
  const activateMutation = useActivatePhase();
  const [ingredientIds, setIngredientIds] = useState<string[]>(
    phase.ingredients.map((item) => item.ingredientId),
  );
  const [productIds, setProductIds] = useState<string[]>(
    phase.products.map((item) => item.productVariantId),
  );

  const busy =
    setIngredientsMutation.isPending ||
    setProductsMutation.isPending ||
    generateMutation.isPending ||
    saveRoutineMutation.isPending ||
    activateMutation.isPending;
  const selectedProducts = useMemo(() => new Set(productIds), [productIds]);

  async function saveIngredients() {
    try {
      await setIngredientsMutation.mutateAsync({
        phaseId: phase.id,
        ingredientIds,
      });
      toast.success("Đã lưu hoạt chất cho phase.");
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
      toast.success("Đã lưu sản phẩm cho phase.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể lưu sản phẩm.",
      );
    }
  }

  async function generateAndSaveRoutine() {
    try {
      const routine = await generateMutation.mutateAsync(phase.id);
      await saveRoutineMutation.mutateAsync({
        routineId: routine.id,
        treatmentId: phase.treatmentId,
      });
      toast.success("Đã tạo và lưu routine.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể tạo routine.",
      );
    }
  }

  async function activate() {
    try {
      await activateMutation.mutateAsync(phase.id);
      toast.success("Phase đã được kích hoạt.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể kích hoạt phase.",
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

      <div className="flex flex-wrap gap-2 border-t pt-4 lg:col-span-2">
        <Button
          variant="outline"
          disabled={busy || productIds.length === 0}
          onClick={() => void generateAndSaveRoutine()}
        >
          <Sparkles className="mr-2 h-4 w-4" /> Tạo và lưu routine
        </Button>
        <Button
          disabled={busy || phase.status === "ACTIVE"}
          onClick={() => void activate()}
        >
          <Check className="mr-2 h-4 w-4" /> Kích hoạt phase
        </Button>
      </div>
    </div>
  );
}
