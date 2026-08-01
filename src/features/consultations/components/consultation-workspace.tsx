"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardPlus,
  FileClock,
  Loader2,
  MessageSquare,
  Play,
  ShieldAlert,
  Stethoscope,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import {
  useBookingDetail,
  useCompleteBooking,
  useStartBooking,
} from "@/features/booking/hooks/useBooking";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { useCustomerConsultationContext } from "../hooks/useConsultation";
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
  const {
    data: booking,
    isLoading,
    isError,
    refetch,
  } = useBookingDetail(bookingId);
  const startMutation = useStartBooking();
  const completeMutation = useCompleteBooking();
  const context = useCustomerConsultationContext(
    booking?.customerId ?? "",
    perspective === "expert",
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
        <p className="text-sm text-slate-700">
          Không thể mở ca tư vấn này hoặc bạn không có quyền truy cập.
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
    perspective === "expert" ? "/expert" : "/profile?tab=appointments";

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
                  variant="outline"
                  onClick={() =>
                    router.push(
                      `/expert/treatments/builder?customerId=${booking.customerId}&customerName=${encodeURIComponent(booking.customerName || "Khách hàng")}&sourceConsultationId=${booking.id}`,
                    )
                  }
                >
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  Lập phác đồ
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

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {!canCommunicate ? (
          <div className="border bg-white p-8 text-center text-sm text-slate-600">
            Ca tư vấn đã bị hủy nên phòng liên lạc không còn khả dụng.
          </div>
        ) : (
          <Tabs defaultValue="video">
            <TabsList variant="line" className="mb-3">
              <TabsTrigger value="video">
                <Video className="h-4 w-4" /> Video
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4" /> Tin nhắn
              </TabsTrigger>
              {perspective === "expert" && (
                <TabsTrigger value="record">
                  <FileClock className="h-4 w-4" /> Hồ sơ khách hàng
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent
              value="video"
              className="overflow-hidden border bg-white"
            >
              <ZegoVideoRoom bookingId={bookingId} />
            </TabsContent>
            <TabsContent
              value="chat"
              className="overflow-hidden border bg-white"
            >
              <ZegoChatPanel bookingId={bookingId} />
            </TabsContent>
            {perspective === "expert" && (
              <TabsContent value="record" className="border bg-white">
                <CustomerRecordPanel
                  isLoading={context.isLoading}
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
  data,
}: {
  isLoading: boolean;
  data: ReturnType<typeof useCustomerConsultationContext>["data"];
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải hồ sơ...
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
      <section className="p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Lịch sử khảo sát
        </h2>
        <div className="mt-4 space-y-5">
          {data?.surveyHistory.length ? (
            data.surveyHistory.map((survey) => (
              <section key={survey.id} className="border-b pb-5 last:border-0">
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
                          answer.labels.map((label) => label.name).join(", ") ||
                          "Không có câu trả lời"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))
          ) : (
            <p className="text-sm text-slate-500">Chưa có khảo sát hoàn tất.</p>
          )}
        </div>
      </section>
    </div>
  );
}
