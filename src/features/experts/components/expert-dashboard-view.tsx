"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  UserCheck,
  XCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Stethoscope,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";

import {
  useExpertBookings,
  useConfirmBooking,
  useCancelBooking,
  useStartBooking,
  useCompleteBooking,
} from "@/features/booking/hooks/useBooking";
import type { Booking } from "@/features/booking/types/booking.types";

type FilterTab =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export function ExpertDashboardView() {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");

  // Queries & Mutations
  const {
    data: bookings = [],
    isLoading,
    isError,
    refetch,
  } = useExpertBookings();

  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const startMutation = useStartBooking();
  const completeMutation = useCompleteBooking();

  // Handlers
  const handleConfirm = (bookingId: string) => {
    confirmMutation.mutate(bookingId, {
      onSuccess: () => {
        toast.success("Đã chấp nhận lịch hẹn tư vấn!");
      },
      onError: (err: unknown) => {
        const msg = (err as Error)?.message || "Không thể chấp nhận lịch hẹn.";
        toast.error(msg);
      },
    });
  };

  const handleOpenCancelModal = (booking: Booking) => {
    setCancelModalBooking(booking);
    setCancelReason("");
  };

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    cancelMutation.mutate(
      { id: cancelModalBooking.id, reason: cancelReason },
      {
        onSuccess: () => {
          toast.success("Đã hủy lịch hẹn tư vấn.");
          setCancelModalBooking(null);
        },
        onError: (err: unknown) => {
          const msg = (err as Error)?.message || "Không thể hủy lịch hẹn.";
          toast.error(msg);
        },
      },
    );
  };

  const handleStart = (bookingId: string) => {
    startMutation.mutate(bookingId, {
      onSuccess: () => {
        toast.success("Đã bắt đầu ca tư vấn!");
        setActiveTab("IN_PROGRESS");
      },
      onError: (err: unknown) => {
        const msg = (err as Error)?.message || "Không thể bắt đầu ca tư vấn.";
        toast.error(msg);
      },
    });
  };

  const handleComplete = (bookingId: string) => {
    completeMutation.mutate(bookingId, {
      onSuccess: () => {
        toast.success("Đã hoàn thành ca tư vấn thành công! 🎉");
        setActiveTab("COMPLETED");
      },
      onError: (err: unknown) => {
        const msg =
          (err as Error)?.message || "Không thể hoàn thành ca tư vấn.";
        toast.error(msg);
      },
    });
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    // Filter by tab status
    const normStatus = (b.status || "").toUpperCase();
    if (activeTab !== "ALL" && normStatus !== activeTab) {
      if (activeTab === "CONFIRMED" && normStatus === "PAID") {
        // match
      } else {
        return false;
      }
    }

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = b.expertName?.toLowerCase().includes(q);
      const matchReason = b.symptoms?.toLowerCase().includes(q);
      const matchId = b.id?.toLowerCase().includes(q);
      return matchName || matchReason || matchId;
    }
    return true;
  });

  // Calculate statistics
  const pendingCount = bookings.filter(
    (b) => (b.status || "").toUpperCase() === "PENDING",
  ).length;
  const confirmedCount = bookings.filter(
    (b) =>
      (b.status || "").toUpperCase() === "CONFIRMED" ||
      (b.status || "").toUpperCase() === "PAID",
  ).length;
  const completedCount = bookings.filter(
    (b) => (b.status || "").toUpperCase() === "COMPLETED",
  ).length;
  const inProgressCount = bookings.filter(
    (b) => (b.status || "").toUpperCase() === "IN_PROGRESS",
  ).length;

  return (
    <div className="space-y-6">
      {/* ── Header Welcome ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Workspace Chuyên Gia Da Liễu
          </h2>
          <p className="text-sm text-slate-500">
            Quản lý các ca khám tư vấn, duyệt lịch hẹn và thực hiện cuộc gọi hỗ
            trợ khách hàng.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="self-start rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:self-auto"
        >
          Làm mới danh sách
        </Button>
      </div>

      {/* ── Top Stats Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Chờ xác nhận</p>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Đã xác nhận</p>
            <p className="text-2xl font-bold text-slate-900">
              {confirmedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Đã hoàn thành
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {completedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">
              Tổng ca tư vấn
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {bookings.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        {/* Search & Tabs Filter Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            {(
              [
                { id: "ALL", label: "Tất cả" },
                { id: "PENDING", label: `Chờ duyệt (${pendingCount})` },
                { id: "CONFIRMED", label: `Đã duyệt (${confirmedCount})` },
                {
                  id: "IN_PROGRESS",
                  label: `Đang tư vấn (${inProgressCount})`,
                },
                { id: "COMPLETED", label: `Hoàn tất (${completedCount})` },
                { id: "CANCELLED", label: "Đã hủy" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo triệu chứng, mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-xl border-slate-200 pl-9 text-xs"
            />
          </div>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <p className="text-xs font-semibold">
              Đang nạp danh sách lịch hẹn tư vấn...
            </p>
          </div>
        ) : isError ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-red-500">
            <AlertCircle className="h-8 w-8" />
            <p className="text-xs font-semibold">
              Không thể nạp danh sách ca hẹn tư vấn.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
            <Calendar className="h-8 w-8 text-slate-300" />
            <p className="text-xs font-semibold">
              Không có ca tư vấn nào phù hợp.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const statusNorm = (booking.status || "").toUpperCase();

              return (
                <div
                  key={booking.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition-all hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Left: Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        #{booking.id.substring(0, 8)}
                      </span>
                      {getStatusBadge(statusNorm)}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                        {new Date(booking.dateTime).toLocaleString("vi-VN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                      {booking.symptoms && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                          Lý do: &quot;{booking.symptoms}&quot;
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action: Pending -> Confirm */}
                    {statusNorm === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          disabled={confirmMutation.isPending}
                          onClick={() => handleConfirm(booking.id)}
                          className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          {confirmMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                              Chấp Nhận
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCancelModal(booking)}
                          className="rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          Từ Chối
                        </Button>
                      </>
                    )}

                    {/* Action: Confirmed -> Start */}
                    {(statusNorm === "CONFIRMED" || statusNorm === "PAID") && (
                      <>
                        <Button
                          size="sm"
                          disabled={startMutation.isPending}
                          onClick={() => handleStart(booking.id)}
                          className="rounded-xl bg-teal-600 text-xs font-bold text-white shadow-xs hover:bg-teal-700"
                        >
                          {startMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Play className="mr-1.5 h-3.5 w-3.5" />
                              Bắt Đầu Tư Vấn
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCancelModal(booking)}
                          className="rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Hủy Ca
                        </Button>
                      </>
                    )}

                    {/* Action: In Progress -> Complete */}
                    {statusNorm === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        disabled={completeMutation.isPending}
                        onClick={() => handleComplete(booking.id)}
                        className="rounded-xl bg-violet-600 text-xs font-bold text-white shadow-xs hover:bg-violet-700"
                      >
                        {completeMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Hoàn Thành Ca Tư Vấn
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal Dialog: Cancel / Reject Booking ── */}
      <Dialog
        open={Boolean(cancelModalBooking)}
        onOpenChange={(open) => {
          if (!open) setCancelModalBooking(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Hủy / Từ Chối Lịch Hẹn Tư Vấn
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Vui lòng nhập lý do từ chối hoặc hủy ca hẹn này để thông báo tới
              khách hàng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-bold text-slate-700">
              Lý do từ chối (không bắt buộc)
            </label>
            <Input
              type="text"
              placeholder="VD: Bác sĩ có ca mổ đột xuất / Trùng lịch hội thảo..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="rounded-xl border-slate-200 text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCancelModalBooking(null)}
              className="rounded-xl text-xs font-medium text-slate-500"
            >
              Quay lại
            </Button>
            <Button
              size="sm"
              disabled={cancelMutation.isPending}
              onClick={handleConfirmCancel}
              className="rounded-xl bg-red-600 text-xs font-bold text-white shadow-xs hover:bg-red-700"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Xác Nhận Hủy"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Status Badge Renderer
 */
function getStatusBadge(statusNorm: string) {
  switch (statusNorm) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-800"
        >
          Chờ xác nhận
        </Badge>
      );
    case "CONFIRMED":
    case "PAID":
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-800"
        >
          Đã xác nhận
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className="border-teal-200 bg-teal-50 text-[10px] font-bold text-teal-800"
        >
          Đang tư vấn
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-violet-200 bg-violet-50 text-[10px] font-bold text-violet-800"
        >
          Đã hoàn thành
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="border-red-200 bg-red-50 text-[10px] font-bold text-red-800"
        >
          Đã hủy
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px]">
          {statusNorm}
        </Badge>
      );
  }
}
