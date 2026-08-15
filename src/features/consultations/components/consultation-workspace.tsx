"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  FileClock,
  History,
  Loader2,
  MessageSquare,
  Play,
  ShieldAlert,
  Stethoscope,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  useBookingDetail,
  useCompleteBooking,
  useStartBooking,
} from "@/features/booking/hooks/useBooking";
import {
  useTreatmentChart,
  useTreatmentPlans,
} from "@/features/treatments/hooks/useTreatments";
import type { TreatmentStatus } from "@/features/treatments/types/treatment.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { TreatmentPlanBuilder } from "@/features/treatments/components/treatment-plan-builder";
import { useCustomerConsultationContext } from "../hooks/useConsultation";
import { getBookingWorkspaceError } from "../utils/consultation-errors";
import { ZegoChatPanel } from "./zego-chat-panel";
import { ZegoVideoRoom } from "./zego-video-room";

interface ConsultationWorkspaceProps {
  bookingId: string;
  perspective: "customer" | "expert";
}

const statusLabel = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_progress: "Đang tư vấn",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
} as const;

export function ConsultationWorkspace({
  bookingId,
  perspective,
}: ConsultationWorkspaceProps) {
  const router = useRouter();
  const [isTreatmentPanelOpen, setIsTreatmentPanelOpen] = useState(false);
  const {
    data: booking,
    isLoading,
    isError,
    error: bookingError,
    refetch,
  } = useBookingDetail(bookingId);
  const startMutation = useStartBooking();
  const completeMutation = useCompleteBooking();
  const context = useCustomerConsultationContext(
    booking?.customerId ?? "",
    bookingId,
    perspective === "expert",
  );
  const expertTreatments = useTreatmentPlans(
    "expert",
    {},
    {
      enabled: perspective === "expert" && Boolean(booking?.customerId),
    },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Đang tải ca tư vấn...
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="h-9 w-9 text-red-500" />
        <p className="max-w-md text-sm text-slate-700">
          {getBookingWorkspaceError(bookingError)}
        </p>
        <Button variant="outline" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    );
  }

  const canCommunicate = booking.status !== "cancelled";
  const peerName =
    perspective === "expert" ? booking.customerName : booking.expertName;
  const backPath =
    perspective === "expert"
      ? "/expert/consultations"
      : "/profile?tab=appointments";
  const customerId = booking.customerId;
  const customerName = booking.customerName || "Khách hàng";
  const consultationId = booking.id;
  const existingTreatment = expertTreatments.data?.find(
    (plan) =>
      plan.customerId === customerId &&
      plan.status !== "CANCELLED" &&
      plan.status !== "COMPLETED",
  );

  function toggleTreatmentPanel() {
    if (!customerId || !consultationId) {
      toast.error("Ca tư vấn đang thiếu thông tin khách hàng để lập phác đồ.");
      return;
    }
    setIsTreatmentPanelOpen((prev) => !prev);
  }

  async function startConsultation() {
    try {
      await startMutation.mutateAsync(bookingId);
      toast.success("Ca tư vấn đã bắt đầu.");
      await refetch();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể bắt đầu ca.",
      );
    }
  }

  async function completeConsultation() {
    try {
      await completeMutation.mutateAsync(bookingId);
      toast.success("Ca tư vấn đã hoàn thành.");
      await refetch();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Không thể hoàn thành ca.",
      );
    }
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => router.push(backPath)}
              aria-label="Quay lại"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-semibold text-slate-950">
                  Tư vấn với {peerName || "người tham gia"}
                </h1>
                <Badge variant="outline">{statusLabel[booking.status]}</Badge>
                {booking.isFollowUp && <Badge>Tái khám</Badge>}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {new Date(booking.dateTime).toLocaleString("vi-VN")} · Mã ca{" "}
                {booking.id.slice(0, 8)}
              </p>
            </div>
          </div>

          {perspective === "expert" && (
            <div className="flex flex-wrap gap-2">
              {booking.status === "confirmed" && (
                <Button
                  onClick={() => void startConsultation()}
                  disabled={startMutation.isPending}
                >
                  {startMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  Bắt đầu ca
                </Button>
              )}
              {(booking.status === "in_progress" ||
                booking.status === "completed") && (
                <Button
                  variant={isTreatmentPanelOpen ? "default" : "outline"}
                  onClick={toggleTreatmentPanel}
                  disabled={expertTreatments.isLoading}
                  className={
                    isTreatmentPanelOpen
                      ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700"
                      : ""
                  }
                >
                  {expertTreatments.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ClipboardPlus className="mr-2 h-4 w-4" />
                  )}
                  {isTreatmentPanelOpen
                    ? "Đóng bảng phác đồ"
                    : existingTreatment
                      ? "Mở phác đồ"
                      : "Lập phác đồ"}
                </Button>
              )}
              {booking.status === "in_progress" && (
                <Button
                  variant="outline"
                  onClick={() => void completeConsultation()}
                  disabled={completeMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Hoàn thành ca
                </Button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Floating Non-Modal Side Panel for Treatment Plan (No background blur/overlay) */}
      {isTreatmentPanelOpen && perspective === "expert" && (
        <aside
          aria-label="Bảng lập phác đồ điều trị nổi"
          className="animate-in fade-in slide-in-from-right-8 fixed top-20 right-4 bottom-6 z-40 flex w-[560px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl backdrop-blur-md transition-all duration-300 sm:right-6"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                <ClipboardPlus className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-950">
                  {existingTreatment
                    ? "Phác đồ điều trị"
                    : "Lập phác đồ điều trị"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {customerName} · Nổi song song cùng ca gọi video
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsTreatmentPanelOpen(false)}
                className="h-8 w-8 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                title="Đóng bảng phác đồ"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <TreatmentPlanBuilder
              initialTreatmentId={existingTreatment?.id}
              initialCustomerId={customerId}
              initialCustomerName={customerName}
              initialSourceConsultationId={consultationId}
              isDrawer
              onClose={() => setIsTreatmentPanelOpen(false)}
              onPlanCreated={() => {
                void expertTreatments.refetch();
              }}
            />
          </div>
        </aside>
      )}

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {!canCommunicate ? (
          <div className="border bg-white p-8 text-center text-sm text-slate-600">
            Ca tư vấn đã bị hủy nên phòng liên lạc không còn khả dụng.
          </div>
        ) : (
          <Tabs defaultValue="video">
            <TabsList variant="line" className="mb-3.5">
              <TabsTrigger value="video" className="text-xs font-semibold">
                <Video className="h-4 w-4" /> Video Call
              </TabsTrigger>
              <TabsTrigger value="chat" className="text-xs font-semibold">
                <MessageSquare className="h-4 w-4" /> Tin nhắn
              </TabsTrigger>
              {perspective === "expert" && (
                <TabsTrigger value="record" className="text-xs font-semibold">
                  <FileClock className="h-4 w-4" /> Hồ sơ khách hàng
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent
              value="video"
              keepMounted
              className="overflow-hidden rounded-3xl bg-slate-950 shadow-sm"
            >
              <ZegoVideoRoom bookingId={bookingId} />
            </TabsContent>
            <TabsContent
              value="chat"
              keepMounted
              className="h-[calc(100vh-210px)] min-h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs"
            >
              <ZegoChatPanel bookingId={bookingId} />
            </TabsContent>
            {perspective === "expert" && (
              <TabsContent
                value="record"
                className="h-[calc(100vh-210px)] min-h-[520px] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-xs"
              >
                <CustomerRecordPanel
                  isLoading={context.isLoading}
                  isError={context.isError}
                  onRetry={() => void context.refetch()}
                  data={context.data}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
    </div>
  );
}

function CustomerRecordPanel({
  isLoading,
  isError,
  onRetry,
  data,
}: {
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  data: ReturnType<typeof useCustomerConsultationContext>["data"];
}) {
  const [selectedTreatmentId, setSelectedTreatmentId] = useState("");
  const chart = useTreatmentChart(selectedTreatmentId);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải hồ sơ...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-red-600">
          Không thể tải hồ sơ khách hàng cho ca tư vấn này.
        </p>
        <Button variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
      <aside className="border-b p-5 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Stethoscope className="h-4 w-4 text-emerald-700" /> Tổng quan
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-slate-500">Loại da</dt>
            <dd className="font-medium text-slate-900">
              {data?.customer?.skinType?.name || "Chưa xác định"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Dị ứng</dt>
            <dd className="font-medium text-slate-900">
              {data?.allergies.length
                ? data.allergies.map((item) => item.name).join(", ")
                : "Không ghi nhận"}
            </dd>
          </div>
        </dl>
      </aside>
      <section className="space-y-7 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <History className="h-4 w-4 text-emerald-700" /> Lịch sử điều trị
          </h2>
          <div className="mt-4 space-y-3">
            {data.treatmentHistory?.length ? (
              data.treatmentHistory.map((treatment) => (
                <div key={treatment.treatmentId} className="border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-950">
                          {treatment.title}
                        </h3>
                        <Badge variant="outline">
                          {treatmentStatusLabel[treatment.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Chuyên gia: {treatment.expert.name || "Chưa cập nhật"} ·{" "}
                        {treatment.phaseCount} phase
                      </p>
                      {treatment.currentPhase && (
                        <p className="mt-2 text-sm text-slate-700">
                          Phase hiện tại:{" "}
                          {treatment.currentPhase.title ||
                            `Phase ${treatment.currentPhase.phaseOrder}`}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedTreatmentId((current) =>
                          current === treatment.treatmentId
                            ? ""
                            : treatment.treatmentId,
                        )
                      }
                    >
                      {selectedTreatmentId === treatment.treatmentId
                        ? "Đóng hồ sơ"
                        : "Xem hồ sơ"}
                    </Button>
                  </div>
                  {selectedTreatmentId === treatment.treatmentId && (
                    <TreatmentChartSummary
                      isLoading={chart.isLoading}
                      isError={chart.isError}
                      data={chart.data}
                      onRetry={() => void chart.refetch()}
                    />
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Chưa có phác đồ điều trị đã được triển khai.
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-sm font-semibold text-slate-900">
            Lịch sử khảo sát
          </h2>
          <div className="mt-4 space-y-5">
            {data?.surveyHistory.length ? (
              data.surveyHistory.map((survey) => (
                <section
                  key={survey.id}
                  className="border-b pb-5 last:border-0"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {new Date(
                      survey.completedAt ?? survey.createdAt,
                    ).toLocaleDateString("vi-VN")}
                  </p>
                  <dl className="mt-3 grid gap-3 md:grid-cols-2">
                    {survey.answers.map((answer) => (
                      <div key={answer.questionCode}>
                        <dt className="text-xs text-slate-500">
                          {answer.questionText}
                        </dt>
                        <dd className="mt-0.5 text-sm text-slate-900">
                          {answer.value ||
                            answer.labels
                              .map((label) => label.name)
                              .join(", ") ||
                            "Không có câu trả lời"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                Chưa có khảo sát hoàn tất.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const treatmentStatusLabel: Record<TreatmentStatus, string> = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang điều trị",
  PAUSED: "Tạm dừng",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
};

function TreatmentChartSummary({
  isLoading,
  isError,
  data,
  onRetry,
}: {
  isLoading: boolean;
  isError: boolean;
  data: ReturnType<typeof useTreatmentChart>["data"];
  onRetry: () => void;
}) {
  if (isLoading) {
    return (
      <div className="mt-4 flex min-h-24 items-center justify-center border-t text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải hồ sơ điều
        trị...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mt-4 border-t pt-4">
        <p className="text-sm text-red-600">Không thể tải hồ sơ điều trị.</p>
        <Button className="mt-2" size="sm" variant="outline" onClick={onRetry}>
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 grid gap-3 border-t pt-4 md:grid-cols-2">
      {data.phases.map((phase) => (
        <div key={phase.id} className="bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">
            Phase {phase.phaseOrder}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {phase.title || "Chưa đặt tên"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {phase.noteByExpert || "Chưa có ghi chú chuyên môn."}
          </p>
        </div>
      ))}
    </div>
  );
}
