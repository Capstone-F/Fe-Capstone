"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  Loader2,
  MessageSquareText,
  Stethoscope,
  UserRound,
  Video,
  WalletCards,
  XCircle,
} from "lucide-react";

import { CancelBookingDialog } from "@/features/booking/components/cancel-booking-dialog";
import { FeedbackModal } from "@/features/booking/components/feedback-modal";
import { useBookingDetail } from "@/features/booking/hooks/useBooking";
import type { ConsultationBooking } from "@/features/booking/types/booking.types";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { formatVnd } from "@/shared/utils/format";

const statusPresentation: Record<
  ConsultationBooking["status"],
  { label: string; className: string; description: string }
> = {
  pending: {
    label: "Chờ thanh toán / xác nhận",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    description:
      "Hoàn tất thanh toán bằng Ví GlowScan để chuyên gia có thể xác nhận lịch hẹn.",
  },
  confirmed: {
    label: "Đã xác nhận",
    className: "border-blue-200 bg-blue-50 text-blue-800",
    description:
      "Chuyên gia đã xác nhận lịch hẹn. Phòng tư vấn sẽ mở khi chuyên gia bắt đầu ca.",
  },
  in_progress: {
    label: "Đang tư vấn",
    className: "border-violet-200 bg-violet-50 text-violet-800",
    description:
      "Ca tư vấn đang diễn ra. Bạn có thể vào phòng video hoặc nhắn tin.",
  },
  completed: {
    label: "Đã hoàn thành",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    description:
      "Ca tư vấn đã hoàn tất. Xem phác đồ điều trị hoặc gửi đánh giá cho chuyên gia.",
  },
  cancelled: {
    label: "Đã hủy",
    className: "border-rose-200 bg-rose-50 text-rose-800",
    description:
      "Lịch hẹn đã hủy. Nếu ca đã thanh toán, khoản hoàn ví do hệ thống xử lý theo chính sách hiện hành.",
  },
};

function formatBookingDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatBookingTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function CustomerBookingDetailPage({
  bookingId,
}: {
  bookingId: string;
}) {
  const router = useRouter();
  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch,
  } = useBookingDetail(bookingId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[440px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        Đang tải thông tin lịch tư vấn...
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="mx-auto flex min-h-[440px] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
        <XCircle className="h-10 w-10 text-rose-500" />
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            Không thể tải lịch tư vấn
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {error instanceof Error
              ? error.message
              : "Lịch hẹn có thể không tồn tại hoặc không thuộc tài khoản của bạn."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => void refetch()}>
            Thử lại
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/appointments")}
          >
            Về danh sách lịch hẹn
          </Button>
        </div>
      </div>
    );
  }

  const status = statusPresentation[booking.status];
  const canPay =
    booking.status === "pending" && !booking.isPaid && !booking.isFollowUp;
  const canCancel =
    booking.status === "pending" || booking.status === "confirmed";
  const canJoin = booking.status === "in_progress";
  const canLeaveFeedback = booking.status === "completed" && !booking.feedback;
  const canViewTreatment =
    Boolean(booking.treatmentId) || booking.status === "completed";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 py-2 sm:py-5">
      <Link
        href="/appointments"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Lịch tư vấn của tôi
      </Link>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="gap-4 border-b bg-slate-50/70 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl text-slate-950">
                Tư vấn cùng {booking.expertName}
              </CardTitle>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
              {booking.isFollowUp ? <Badge>Tái khám miễn phí</Badge> : null}
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {status.description}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 font-mono text-xs text-slate-500 ring-1 ring-slate-200">
            Mã ca {booking.id.slice(0, 8).toUpperCase()}
          </span>
        </CardHeader>
        <CardContent className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            icon={UserRound}
            label="Chuyên gia phụ trách"
            value={booking.expertName}
          />
          <DetailItem
            icon={CalendarDays}
            label="Ngày tư vấn"
            value={formatBookingDate(booking.dateTime)}
          />
          <DetailItem
            icon={Clock3}
            label="Khung giờ bắt đầu"
            value={formatBookingTime(booking.dateTime)}
          />
          <DetailItem
            icon={CircleDollarSign}
            label="Phí tư vấn"
            value={
              booking.isFollowUp
                ? "0 ₫ · Tái khám"
                : formatVnd(booking.feeChargedVnd)
            }
          />
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,.85fr)]">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-emerald-700" /> Thông tin ca tư
              vấn
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 py-5">
            <section>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Mối quan tâm về da
              </p>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-800">
                {booking.symptoms ||
                  "Bạn chưa cung cấp ghi chú cho chuyên gia."}
              </p>
            </section>
            <section className="border-t pt-5">
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                Thanh toán
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <WalletCards className="h-4 w-4 text-emerald-700" />
                {booking.isPaid ? (
                  <span>
                    Đã thanh toán bằng Ví GlowScan
                    {booking.isFollowUp ? " · Không tính phí tái khám" : ""}.
                  </span>
                ) : (
                  <span>
                    Chưa thanh toán. Lịch chưa thể được chuyên gia xác nhận.
                  </span>
                )}
              </div>
            </section>
            {booking.status === "cancelled" && (
              <section className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="font-medium text-rose-900">Thông tin hủy lịch</p>
                <p className="mt-1 text-sm text-rose-800">
                  {booking.cancelReason || "Không có lý do hủy được ghi nhận."}
                </p>
                {booking.cancelledAt ? (
                  <p className="mt-2 text-xs text-rose-700">
                    Cập nhật lúc{" "}
                    {new Date(booking.cancelledAt).toLocaleString("vi-VN")}
                    {booking.cancelledBy ? ` · ${booking.cancelledBy}` : ""}
                  </p>
                ) : null}
              </section>
            )}
            {booking.feedback && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-medium text-amber-950">
                  Đánh giá của bạn: {booking.feedback.rating}/5
                </p>
                {booking.feedback.comment ? (
                  <p className="mt-1 text-sm text-amber-900">
                    {booking.feedback.comment}
                  </p>
                ) : null}
              </section>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-emerald-700" /> Hành động
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 py-5">
            {canPay && (
              <Link
                href={`/booking/${booking.expertId}/checkout?bookingId=${booking.id}`}
              >
                <Button className="w-full">
                  <WalletCards className="mr-2 h-4 w-4" /> Thanh toán qua ví
                </Button>
              </Link>
            )}
            {canJoin && (
              <Link href={`/appointments/${booking.id}/consultation`}>
                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  <Video className="mr-2 h-4 w-4" /> Vào phòng tư vấn
                </Button>
              </Link>
            )}
            {canViewTreatment && (
              <Link href="/care">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" /> Xem phác đồ và routine
                </Button>
              </Link>
            )}
            {canLeaveFeedback && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFeedbackOpen(true)}
              >
                <MessageSquareText className="mr-2 h-4 w-4" /> Đánh giá tư vấn
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outline"
                className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                onClick={() => setCancelOpen(true)}
              >
                <XCircle className="mr-2 h-4 w-4" /> Hủy lịch hẹn
              </Button>
            )}
            {!canPay &&
              !canJoin &&
              !canViewTreatment &&
              !canLeaveFeedback &&
              !canCancel && (
                <p className="rounded-lg bg-slate-50 p-3 text-sm leading-5 text-slate-600">
                  Hiện không có thao tác nào khả dụng cho trạng thái lịch hẹn
                  này.
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <TimelineStep label="Tạo lịch" done />
        <TimelineStep label="Thanh toán" done={booking.isPaid} />
        <TimelineStep
          label="Tư vấn"
          done={booking.status === "completed"}
          active={booking.status === "in_progress"}
        />
      </div>

      <CancelBookingDialog
        bookingId={booking.id}
        isOpen={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          void refetch();
        }}
      />
      <FeedbackModal
        bookingId={booking.id}
        doctorName={booking.expertName}
        isOpen={feedbackOpen}
        onClose={() => {
          setFeedbackOpen(false);
          void refetch();
        }}
      />
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-sm leading-5 font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function TimelineStep({
  label,
  done = false,
  active = false,
}: {
  label: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
        done
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : active
            ? "border-violet-200 bg-violet-50 text-violet-800"
            : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      {done ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : (
        <span className="h-2 w-2 rounded-full bg-current" />
      )}
      <span className="font-medium">{label}</span>
    </div>
  );
}
