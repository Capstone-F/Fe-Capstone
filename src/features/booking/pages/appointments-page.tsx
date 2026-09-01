"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  CreditCard,
  MessageSquare,
  CalendarX,
  AlertCircle,
  Info,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useBookings } from "@/features/booking/hooks/useBooking";
import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";
import { Card, CardContent } from "@/shared/components/ui/card";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { AppointmentCardSkeleton } from "@/features/booking/components/appointment-card-skeleton";
import { CancelBookingDialog } from "@/features/booking/components/cancel-booking-dialog";

export function AppointmentsPage() {
  const { data: bookings, isLoading, isError, error, refetch } = useBookings();
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");

  const t = {
    title: "Lịch hẹn tư vấn của tôi",
    subtitle:
      "Xem và quản lý các lượt tư vấn trực tiếp cùng chuyên gia da liễu.",
    bookedAtLabel: "Đặt lúc:",
    expertInCharge: "Chuyên gia phụ trách",
    appointmentTime: "Thời gian hẹn",
    serviceFee: "Phí dịch vụ",
    concernLabel: "Mối quan tâm về da:",
    status: {
      paid: "Đã thanh toán",
      confirmed: "Đã xác nhận",
      cancelled: "Đã hủy",
      pending: "Chờ thanh toán",
    },
    payNow: "Thanh toán ngay",
    waiting: "Chờ đến lượt tư vấn",
    completed: "Hoàn thành",
    emptyTitle: "Chưa có lịch hẹn nào",
    emptyHint:
      "Lịch sử đặt tư vấn trực tiếp cùng chuyên gia da liễu sẽ hiển thị tại đây.",
    emptyAction: "Tìm chuyên gia đặt lịch ngay",
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (bk: {
    status: string;
    isPaid?: boolean;
    isFollowUp?: boolean;
  }) => {
    if (bk.isFollowUp) {
      return (
        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
          🟢 Tái khám 0đ
        </span>
      );
    }
    switch (bk.status) {
      case "confirmed":
        return (
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            {t.status.confirmed}
          </span>
        );
      case "in_progress":
        return (
          <span className="animate-pulse rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
            🟣 Đang tư vấn
          </span>
        );
      case "completed":
        return (
          <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
            ✅ Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
            {t.status.cancelled}
          </span>
        );
      case "pending":
      default:
        return bk.isPaid ? (
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            🔵 Đã trả ví - Chờ duyệt
          </span>
        ) : (
          <span className="animate-pulse rounded-md bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
            {t.status.pending}
          </span>
        );
    }
  };

  const visibleBookings = useMemo(() => {
    if (!bookings) return [];
    if (activeFilter === "all") return bookings;
    if (activeFilter === "upcoming") {
      return bookings.filter(
        (booking) =>
          booking.status === "pending" ||
          booking.status === "confirmed" ||
          booking.status === "in_progress",
      );
    }
    return bookings.filter((booking) => booking.status === activeFilter);
  }, [activeFilter, bookings]);

  const filters: Array<{
    id: typeof activeFilter;
    label: string;
  }> = [
    { id: "all", label: "Tất cả" },
    { id: "upcoming", label: "Sắp tới" },
    { id: "completed", label: "Đã hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.title}
        </h2>
        <p className="text-muted-foreground text-sm">{t.subtitle}</p>
      </div>

      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Lọc lịch tư vấn"
        >
          {filters.map((filter) => (
            <Button
              key={filter.id}
              type="button"
              size="sm"
              variant={activeFilter === filter.id ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.id)}
              className="rounded-full"
              role="tab"
              aria-selected={activeFilter === filter.id}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="self-start sm:self-auto"
          disabled={isLoading}
          onClick={() => void refetch()}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <AppointmentCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Không thể tải lịch tư vấn"
          description={
            error instanceof Error
              ? error.message
              : "Vui lòng kiểm tra kết nối và thử lại."
          }
          action={{ label: "Thử lại", onClick: () => void refetch() }}
        />
      ) : visibleBookings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {visibleBookings.map((bk) => {
            const canCancel =
              bk.status === "pending" || bk.status === "confirmed";
            return (
              <Card
                key={bk.id}
                className="hover:border-slate-350 overflow-hidden border-slate-200 shadow-xs transition-colors"
              >
                <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
                  <span className="text-xs font-semibold text-slate-700">
                    Lịch tư vấn với {bk.expertName}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-[10px]">
                      {t.bookedAtLabel}{" "}
                      {new Date(bk.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    {getStatusBadge(bk)}
                  </div>
                </div>

                <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-12">
                  {/* Doctor details */}
                  <div className="flex items-center gap-2.5 md:col-span-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                        {t.expertInCharge}
                      </span>
                      <span className="block text-sm font-bold text-slate-800">
                        {bk.expertName}
                      </span>
                    </div>
                  </div>

                  {/* Time slot */}
                  <div className="flex items-center gap-2.5 md:col-span-4">
                    <Calendar className="text-primary h-5 w-5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                        {t.appointmentTime}
                      </span>
                      <span className="block text-xs font-bold text-slate-700">
                        {formatTime(bk.dateTime)} - {formatDate(bk.dateTime)}
                      </span>
                    </div>
                  </div>

                  {/* Amount details */}
                  <div className="flex items-center gap-2.5 md:col-span-2">
                    <CreditCard className="text-primary h-5 w-5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                        {t.serviceFee}
                      </span>
                      <span className="block text-xs font-bold text-slate-700">
                        {bk.isFollowUp
                          ? "0 đ (Tái khám)"
                          : formatVnd(bk.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 md:col-span-2">
                    {bk.status === "pending" &&
                      !bk.isPaid &&
                      !bk.isFollowUp && (
                        <Link
                          href={`/booking/${bk.expertId}/checkout?bookingId=${bk.id}`}
                        >
                          <Button
                            size="sm"
                            className="bg-amber-600 text-xs text-white hover:bg-amber-700"
                          >
                            {t.payNow}
                          </Button>
                        </Link>
                      )}
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelBookingId(bk.id)}
                        className="border-rose-200 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Hủy hẹn
                      </Button>
                    )}
                    {bk.status !== "cancelled" && (
                      <Link href={`/appointments/${bk.id}`}>
                        <Button size="sm" variant="outline" className="text-xs">
                          <Info className="mr-1.5 h-3.5 w-3.5" />
                          Chi tiết
                        </Button>
                      </Link>
                    )}
                    {bk.status === "cancelled" && (
                      <span className="rounded-md border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/80 dark:text-rose-300">
                        {t.status.cancelled}
                      </span>
                    )}
                  </div>
                </CardContent>

                {/* Symptoms collapse */}
                <div className="flex gap-2 border-t border-slate-100/50 bg-slate-50/10 px-4 py-2 text-xs text-slate-600">
                  <MessageSquare className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <div className="leading-normal italic">
                    <strong className="text-slate-700 not-italic">
                      {t.concernLabel}
                    </strong>{" "}
                    {bk.symptoms}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarX}
          title={
            activeFilter === "all" ? t.emptyTitle : "Không có lịch phù hợp"
          }
          description={
            activeFilter === "all"
              ? t.emptyHint
              : "Thử chọn một trạng thái khác hoặc đặt lịch tư vấn mới."
          }
          action={{ label: t.emptyAction, href: "/experts" }}
        />
      )}

      {cancelBookingId && (
        <CancelBookingDialog
          isOpen={Boolean(cancelBookingId)}
          onClose={() => setCancelBookingId(null)}
          bookingId={cancelBookingId}
        />
      )}
    </div>
  );
}
