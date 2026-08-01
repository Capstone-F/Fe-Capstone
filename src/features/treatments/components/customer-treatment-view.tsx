"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  FileHeart,
  ImagePlus,
  Loader2,
  RefreshCw,
  RotateCcw,
  WalletCards,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useCancelTreatment,
  useCreateProgressPhoto,
  usePayTreatmentPlan,
  useTreatmentChart,
  useTreatmentPlans,
} from "../hooks/useTreatments";
import type { TreatmentPhase, TreatmentPlan } from "../types/treatment.types";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { formatVnd } from "@/shared/utils/format";

export function CustomerTreatmentView() {
  const router = useRouter();
  const plansQuery = useTreatmentPlans("customer");
  const [selectedId, setSelectedId] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const effectiveSelectedId =
    selectedId ||
    plansQuery.data?.find((plan) => plan.status === "ACTIVE")?.id ||
    plansQuery.data?.[0]?.id ||
    "";
  const selectedPlan = plansQuery.data?.find(
    (plan) => plan.id === effectiveSelectedId,
  );
  const chartQuery = useTreatmentChart(
    selectedPlan && selectedPlan.status !== "DRAFT" ? selectedPlan.id : "",
  );

  if (plansQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải hồ sơ điều
        trị...
      </div>
    );
  }

  if (plansQuery.isError) {
    return (
      <div className="border bg-white p-8 text-center">
        <p className="text-sm text-red-600">Không thể tải hồ sơ điều trị.</p>
        <Button
          className="mt-3"
          variant="outline"
          onClick={() => void plansQuery.refetch()}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
        </Button>
      </div>
    );
  }

  if (!plansQuery.data?.length || !selectedPlan) {
    return (
      <div className="border border-dashed bg-white p-10 text-center">
        <FileHeart className="mx-auto h-9 w-9 text-slate-400" />
        <h3 className="mt-3 text-sm font-semibold text-slate-900">
          Chưa có phác đồ điều trị
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Đặt lịch tư vấn để chuyên gia đánh giá và lập phác đồ theo phase.
        </p>
        <Button className="mt-4" onClick={() => router.push("/experts")}>
          Tìm chuyên gia
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {plansQuery.data.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {plansQuery.data.map((plan) => (
            <Button
              key={plan.id}
              variant={plan.id === effectiveSelectedId ? "default" : "outline"}
              onClick={() => setSelectedId(plan.id)}
            >
              {plan.title}
            </Button>
          ))}
        </div>
      )}

      <TreatmentHeader
        plan={selectedPlan}
        onCancel={() => setCancelOpen(true)}
        onRefresh={() => void plansQuery.refetch()}
      />

      <section className="border bg-white">
        <div className="border-b px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-950">
            Lộ trình và ghi chú chuyên môn
          </h3>
        </div>
        <div className="divide-y">
          {selectedPlan.phases.map((phase) => (
            <PhaseRecord key={phase.id} phase={phase} />
          ))}
        </div>
      </section>

      {selectedPlan.status !== "DRAFT" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <ProgressPhotos
            plan={selectedPlan}
            photos={chartQuery.data?.progressPhotos ?? []}
            onRefresh={() => void chartQuery.refetch()}
          />
          <TreatmentActivity
            plan={selectedPlan}
            chart={chartQuery.data}
            isLoading={chartQuery.isLoading}
          />
        </div>
      )}

      <CancelTreatmentDialog
        plan={selectedPlan}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onSuccess={() => {
          void plansQuery.refetch();
          void chartQuery.refetch();
        }}
      />
    </div>
  );
}

function TreatmentHeader({
  plan,
  onCancel,
  onRefresh,
}: {
  plan: TreatmentPlan;
  onCancel: () => void;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const payMutation = usePayTreatmentPlan();
  const cancellable = plan.status === "ACTIVE" || plan.status === "PAUSED";

  async function pay() {
    try {
      await payMutation.mutateAsync(plan.id);
      toast.success("Đã thanh toán phác đồ bằng ví.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Thanh toán thất bại.",
      );
    }
  }

  return (
    <section className="border bg-white">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-950">
              {plan.title}
            </h2>
            <Badge variant="outline">
              {plan.status === "DRAFT" && plan.readyForPayment
                ? "Chờ thanh toán"
                : plan.status}
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            {plan.description || "Không có mô tả."}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {plan.startDate} -{" "}
              {plan.endDate}
            </span>
            <span className="flex items-center gap-1.5">
              <WalletCards className="h-3.5 w-3.5" />{" "}
              {formatVnd(plan.totalPriceVnd ?? 0)}
            </span>
            <span>{plan.phases.length} phase</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.status === "DRAFT" && (
            <Button
              disabled={!plan.readyForPayment || payMutation.isPending}
              onClick={() => void pay()}
            >
              {payMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <WalletCards className="mr-2 h-4 w-4" />
              )}
              Thanh toán
            </Button>
          )}
          {plan.status === "ACTIVE" && (
            <Button
              variant="outline"
              onClick={() => router.push(`/booking/${plan.expertId}`)}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Đặt lịch tái khám
            </Button>
          )}
          {cancellable && (
            <Button
              variant="outline"
              className="text-red-700"
              onClick={onCancel}
            >
              <XCircle className="mr-2 h-4 w-4" /> Hủy phần còn lại
            </Button>
          )}
        </div>
      </div>
      {plan.status === "CANCELLED" && (
        <div className="border-t bg-red-50 px-5 py-3 text-sm text-red-800">
          Đã hủy bởi{" "}
          {plan.cancelledBy === "CUSTOMER" ? "khách hàng" : "chuyên gia"}. Hoàn
          ví: {formatVnd(plan.refundedAmountVnd ?? 0)}.
          {plan.cancelReason ? ` Lý do: ${plan.cancelReason}` : ""}
        </div>
      )}
    </section>
  );
}

function PhaseRecord({ phase }: { phase: TreatmentPhase }) {
  return (
    <article className="grid gap-3 p-5 md:grid-cols-[120px_1fr_auto]">
      <div>
        <p className="text-xs font-medium text-slate-500">
          Phase {phase.phaseOrder + 1}
        </p>
        <Badge className="mt-1" variant="outline">
          {phase.status}
        </Badge>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-950">
          {phase.title || "Không có tiêu đề"}
        </h4>
        {phase.goals && (
          <p className="mt-1 text-sm text-slate-600">Mục tiêu: {phase.goals}</p>
        )}
        <div className="mt-3 border-l-2 border-emerald-600 pl-3">
          <p className="text-xs font-medium text-slate-500">
            Ghi chú của chuyên gia
          </p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-slate-800">
            {phase.noteByExpert || "Chưa có ghi chú."}
          </p>
        </div>
      </div>
      <div className="text-left md:text-right">
        <p className="text-sm font-semibold text-slate-950">
          {formatVnd(phase.priceVnd)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {phase.startDate || "-"} - {phase.endDate || "-"}
        </p>
      </div>
    </article>
  );
}

function ProgressPhotos({
  plan,
  photos,
  onRefresh,
}: {
  plan: TreatmentPlan;
  photos: Array<{
    id: string;
    title: string;
    note: string | null;
    photoUrl: string | null;
    occurredAt: string;
  }>;
  onRefresh: () => void;
}) {
  const mutation = useCreateProgressPhoto();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file || !title.trim()) return;
    try {
      await mutation.mutateAsync({
        treatmentId: plan.id,
        file,
        title: title.trim(),
        note: note.trim() || undefined,
      });
      setFile(null);
      setTitle("");
      setNote("");
      toast.success("Đã thêm ảnh tiến độ.");
      onRefresh();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể tải ảnh tiến độ.",
      );
    }
  }

  return (
    <section className="border bg-white">
      <div className="border-b px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Camera className="h-4 w-4 text-emerald-700" /> Ảnh tiến độ
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
        {photos.map((photo) => (
          <figure key={photo.id}>
            {photo.photoUrl && (
              <Image
                src={photo.photoUrl}
                alt={photo.title}
                width={320}
                height={320}
                unoptimized
                className="aspect-square w-full object-cover"
              />
            )}
            <figcaption className="mt-1 text-xs text-slate-600">
              {photo.title}
            </figcaption>
          </figure>
        ))}
        {photos.length === 0 && (
          <p className="col-span-full text-sm text-slate-500">
            Chưa có ảnh tiến độ.
          </p>
        )}
      </div>
      {plan.status === "ACTIVE" && (
        <form onSubmit={submit} className="space-y-3 border-t p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="progress-title">Tên mốc tiến độ</Label>
              <Input
                id="progress-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress-file">Ảnh (tối đa 5MB)</Label>
              <Input
                id="progress-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="progress-note">Ghi chú</Label>
            <Input
              id="progress-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={!file || !title.trim() || mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="mr-2 h-4 w-4" />
            )}{" "}
            Thêm ảnh
          </Button>
        </form>
      )}
    </section>
  );
}

function TreatmentActivity({
  plan,
  chart,
  isLoading,
}: {
  plan: TreatmentPlan;
  chart: ReturnType<typeof useTreatmentChart>["data"];
  isLoading: boolean;
}) {
  return (
    <section className="border bg-white">
      <div className="border-b px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Clock3 className="h-4 w-4 text-indigo-700" /> Hoạt động điều trị
        </h3>
      </div>
      <div className="space-y-4 p-5">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <div>
              <p className="text-xs text-slate-500">Sản phẩm đã hoàn thành</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {chart?.productsUsed.reduce(
                  (sum, product) => sum + product.completedCount,
                  0,
                ) ?? 0}{" "}
                lượt
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tái khám trực tiếp</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {chart?.inPersonSessions.length ?? 0} buổi
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Phase hiện tại</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />{" "}
                {plan.phases.find((phase) => phase.status === "ACTIVE")
                  ?.title || "Chưa kích hoạt"}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CancelTreatmentDialog({
  plan,
  open,
  onOpenChange,
  onSuccess,
}: {
  plan: TreatmentPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const mutation = useCancelTreatment();
  const [reason, setReason] = useState("");
  const refundable = plan.phases
    .filter((phase) => phase.status === "PENDING")
    .reduce((sum, phase) => sum + phase.priceVnd, 0);

  async function cancel() {
    try {
      const result = await mutation.mutateAsync({
        id: plan.id,
        reason: reason.trim() || undefined,
      });
      toast.success(
        `Đã hủy phần còn lại. Hoàn ví ${formatVnd(result.refundedAmountVnd ?? 0)}.`,
      );
      setReason("");
      onOpenChange(false);
      onSuccess();
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Không thể hủy phác đồ.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hủy phần điều trị còn lại</DialogTitle>
          <DialogDescription>
            Phase đã hoàn thành và phase đang hoạt động vẫn được giữ. Dự kiến
            hoàn phí các phase chưa bắt đầu: {formatVnd(refundable)}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="cancel-reason">Lý do</Label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={2000}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Quay lại
          </Button>
          <Button
            variant="destructive"
            onClick={() => void cancel()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}{" "}
            Xác nhận hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
