"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarClock,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Stethoscope,
  Video,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useExpertMe } from "@/features/experts/hooks/useExperts";
import {
  useExpertBookings,
  useConfirmBooking,
  useStartBooking,
  useCompleteBooking,
  useCancelBooking,
} from "@/features/booking/hooks/useBooking";
import type { ConsultationBooking } from "@/features/booking/types/booking.types";
import { ExpertAvailabilityDialog } from "@/features/admin/components/expert-availability-dialog";
import { toast } from "sonner";

// ─── Helpers ────────────────────────────────────────────────────────────────

type TabType = "all" | "upcoming" | "completed" | "cancelled";

const STATUS_LABEL: Record<ConsultationBooking["status"], string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  in_progress: "Đang tư vấn",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const STATUS_COLOR: Record<ConsultationBooking["status"], string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  in_progress: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-slate-200 bg-slate-50 text-slate-600",
  cancelled: "border-rose-200 bg-rose-50 text-rose-600",
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  };
}

// ─── Booking Card ────────────────────────────────────────────────────────────

function BookingCard({ booking }: { booking: ConsultationBooking }) {
  const router = useRouter();
  const confirmMutation = useConfirmBooking();
  const startMutation = useStartBooking();
  const completeMutation = useCompleteBooking();
  const cancelMutation = useCancelBooking();

  const { date, time } = formatDateTime(booking.dateTime);
  const isPending =
    confirmMutation.isPending ||
    startMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending;
  const canConfirm = booking.isPaid || booking.isFollowUp;

  const handleConfirm = () => {
    confirmMutation.mutate(booking.id, {
      onSuccess: () => toast.success("Đã xác nhận lịch hẹn!"),
      onError: (e) => toast.error((e as Error).message || "Lỗi xác nhận."),
    });
  };

  const handleStart = () => {
    startMutation.mutate(booking.id, {
      onSuccess: () => toast.success("Bắt đầu buổi tư vấn!"),
      onError: (e) => toast.error((e as Error).message || "Lỗi bắt đầu."),
    });
  };

  const handleComplete = () => {
    completeMutation.mutate(booking.id, {
      onSuccess: () => toast.success("Hoàn thành buổi tư vấn! 🎉"),
      onError: (e) => toast.error((e as Error).message || "Lỗi hoàn thành."),
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate(
      { id: booking.id, reason: "Chuyên gia hủy lịch" },
      {
        onSuccess: () => toast.success("Đã hủy lịch hẹn."),
        onError: (e) => toast.error((e as Error).message || "Lỗi hủy lịch."),
      },
    );
  };

  return (
    <Card className="border-slate-200 shadow-xs transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        {/* Top Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                {booking.customerName || "Bệnh nhân chưa cập nhật tên"}
              </p>
              <p className="line-clamp-1 text-xs text-slate-500">
                {booking.symptoms || "Không có mô tả"}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[booking.status]}`}
          >
            {STATUS_LABEL[booking.status]}
          </Badge>
        </div>

        {/* Date/Time Row */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {time}
          </span>
          {booking.isPaid ? (
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
            >
              Đã thanh toán
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-200 bg-amber-50 text-[10px] text-amber-600"
            >
              Chờ thanh toán
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {booking.status !== "cancelled" && booking.status !== "completed" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {booking.status === "pending" && (
              <Button
                size="sm"
                className="h-7 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white hover:bg-blue-700"
                onClick={handleConfirm}
                disabled={isPending || !canConfirm}
                title={
                  canConfirm
                    ? "Xác nhận lịch hẹn"
                    : "Khách hàng cần thanh toán trước khi xác nhận"
                }
              >
                {confirmMutation.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                )}
                {canConfirm ? "Xác nhận" : "Chờ thanh toán"}
              </Button>
            )}

            {booking.status === "confirmed" && (
              <Button
                size="sm"
                className="h-7 rounded-lg bg-emerald-600 px-3 text-[11px] font-bold text-white hover:bg-emerald-700"
                onClick={handleStart}
                disabled={isPending}
              >
                {startMutation.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Play className="mr-1 h-3 w-3" />
                )}
                Bắt đầu
              </Button>
            )}

            {(booking.status === "confirmed" ||
              booking.status === "in_progress") && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-lg border-indigo-200 px-3 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50"
                onClick={() =>
                  router.push(`/expert/consultations/${booking.id}`)
                }
              >
                <Video className="mr-1 h-3 w-3" />
                Phòng tư vấn
              </Button>
            )}

            {booking.status === "in_progress" && (
              <Button
                size="sm"
                className="h-7 rounded-lg bg-slate-800 px-3 text-[11px] font-bold text-white hover:bg-slate-900"
                onClick={handleComplete}
                disabled={isPending}
              >
                {completeMutation.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                )}
                Hoàn thành
              </Button>
            )}

            {(booking.status === "pending" ||
              booking.status === "confirmed") && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-lg border-rose-200 px-3 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                onClick={handleCancel}
                disabled={isPending}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="mr-1 h-3 w-3" />
                )}
                Hủy
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ExpertSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week
  const [availabilityOpen, setAvailabilityOpen] = useState(false);

  const { data: expertProfile, isLoading: loadingProfile } = useExpertMe();
  const { data: allBookings = [], isLoading: loadingBookings } =
    useExpertBookings();

  const weekRange = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    const vietnamDay = now.getDay() || 7;
    monday.setDate(now.getDate() - vietnamDay + 1 + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);
    const endExclusive = new Date(monday);
    endExclusive.setDate(monday.getDate() + 7);
    return { monday, endExclusive };
  }, [weekOffset]);

  const weekBookings = useMemo(
    () =>
      allBookings.filter((booking) => {
        const scheduledAt = new Date(booking.dateTime);
        return (
          scheduledAt >= weekRange.monday &&
          scheduledAt < weekRange.endExclusive
        );
      }),
    [allBookings, weekRange],
  );

  // Filter the selected week's bookings by tab.
  const filteredBookings = useMemo(() => {
    const now = new Date();
    return weekBookings.filter((b) => {
      if (activeTab === "upcoming") {
        return (
          (b.status === "pending" ||
            b.status === "confirmed" ||
            b.status === "in_progress") &&
          new Date(b.dateTime) >= now
        );
      }
      if (activeTab === "completed") return b.status === "completed";
      if (activeTab === "cancelled") return b.status === "cancelled";
      return true; // "all"
    });
  }, [weekBookings, activeTab]);

  // Stats
  const stats = useMemo(
    () => ({
      all: weekBookings.length,
      upcoming: weekBookings.filter(
        (b) =>
          (b.status === "pending" ||
            b.status === "confirmed" ||
            b.status === "in_progress") &&
          new Date(b.dateTime) >= new Date(),
      ).length,
      completed: weekBookings.filter((b) => b.status === "completed").length,
      cancelled: weekBookings.filter((b) => b.status === "cancelled").length,
    }),
    [weekBookings],
  );

  // Week date range label
  const weekLabel = useMemo(() => {
    const sunday = new Date(weekRange.endExclusive);
    sunday.setDate(sunday.getDate() - 1);
    return `${weekRange.monday.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })} – ${sunday.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
  }, [weekRange]);

  const TABS: { key: TabType; label: string }[] = [
    { key: "all", label: `Tất cả (${stats.all})` },
    { key: "upcoming", label: `Sắp tới (${stats.upcoming})` },
    { key: "completed", label: `Đã xong (${stats.completed})` },
    { key: "cancelled", label: `Đã hủy (${stats.cancelled})` },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
            Lịch làm việc
          </p>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            Lịch khám & khung giờ
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Xem lịch theo tuần và thiết lập các khung giờ bệnh nhân có thể đặt
            tư vấn.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="rounded-xl border-emerald-200 bg-white text-xs font-semibold text-emerald-800 shadow-xs hover:bg-emerald-50"
            onClick={() => setAvailabilityOpen(true)}
            disabled={!expertProfile}
          >
            <CalendarClock className="mr-1.5 h-4 w-4" />
            Thiết lập khung giờ
          </Button>

          {/* Expert Profile Card */}
          {loadingProfile ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              <span className="text-xs text-slate-500">Đang tải hồ sơ...</span>
            </div>
          ) : expertProfile ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 shadow-xs">
              <Stethoscope className="h-4 w-4 text-emerald-600" />
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-emerald-900">
                  {expertProfile.name || "Chuyên gia"}
                </p>
                <p className="truncate text-[11px] text-emerald-700">
                  {expertProfile.clinicName || expertProfile.specialization}
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 border-emerald-200 bg-white text-[10px] font-bold text-emerald-700"
              >
                ⭐ {Number(expertProfile.rating || 0).toFixed(1)}
              </Badge>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Lịch trong tuần",
            value: stats.all,
            color: "text-slate-700 bg-slate-50 border-slate-200",
          },
          {
            label: "Sắp tới",
            value: stats.upcoming,
            color: "text-blue-700 bg-blue-50 border-blue-100",
          },
          {
            label: "Đã hoàn thành",
            value: stats.completed,
            color: "text-emerald-700 bg-emerald-50 border-emerald-100",
          },
          {
            label: "Đã hủy",
            value: stats.cancelled,
            color: "text-rose-600 bg-rose-50 border-rose-100",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Week Navigator + Tab Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs sm:p-4 xl:flex-row xl:items-center xl:justify-between">
        {/* Week Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl border-slate-200"
            onClick={() => setWeekOffset((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-center text-sm font-semibold text-slate-700">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-xl border-slate-200"
            onClick={() => setWeekOffset((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {weekOffset !== 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 rounded-xl text-xs text-slate-500"
              onClick={() => setWeekOffset(0)}
            >
              Hôm nay
            </Button>
          )}
        </div>

        {/* Tab Pills */}
        <div className="flex w-full gap-1.5 overflow-x-auto pb-1 xl:w-auto xl:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      {loadingBookings ? (
        <div className="flex items-center justify-center py-16 text-sm text-slate-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Đang tải lịch hẹn...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            Không có lịch hẹn nào trong tuần và bộ lọc đã chọn.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}

      <ExpertAvailabilityDialog
        open={availabilityOpen}
        onOpenChange={setAvailabilityOpen}
        expertName={expertProfile?.name || "Chuyên gia"}
        expertProfileId={expertProfile?.id || null}
      />
    </div>
  );
}
