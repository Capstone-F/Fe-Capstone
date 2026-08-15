"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  Star,
  FilePenLine,
  Video,
  Info,
  RefreshCw,
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
  useBookingDetail,
} from "@/features/booking/hooks/useBooking";
import type { ConsultationBooking } from "@/features/booking/types/booking.types";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group";

type FilterTab =
  | "ALL"
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export function ExpertDashboardView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancelModalBooking, setCancelModalBooking] =
    useState<ConsultationBooking | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [detailBookingId, setDetailBookingId] = useState("");

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
  const detailBooking = useBookingDetail(detailBookingId);

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

  const handleOpenCancelModal = (booking: ConsultationBooking) => {
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

  const handleOpenTreatmentBuilder = (booking: ConsultationBooking) => {
    if (!booking.id || !booking.customerId) {
      toast.error("Ca tư vấn đang thiếu thông tin khách hàng để lập phác đồ.");
      return;
    }

    const query = new URLSearchParams({
      customerId: booking.customerId,
      customerName: booking.customerName || "Khách hàng",
      sourceConsultationId: booking.id,
    });
    router.push(`/expert/treatments/builder?${query.toString()}`);
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    // Filter by tab status
    const normStatus = (b.status || "").toUpperCase();
    if (activeTab !== "ALL" && normStatus !== activeTab) {
      return false;
    }

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = b.expertName?.toLowerCase().includes(q);
      const matchReason = b.symptoms?.toLowerCase().includes(q);
      const matchCustomer = b.customerName?.toLowerCase().includes(q);
      return matchName || matchCustomer || matchReason;
    }
    return true;
  });

  // Calculate statistics
  const pendingCount = bookings.filter(
    (b) => (b.status || "").toUpperCase() === "PENDING",
  ).length;
  const confirmedCount = bookings.filter(
    (b) => (b.status || "").toUpperCase() === "CONFIRMED",
  ).length;
  const completedCount = bookings.filter(
    (b) => (b.status || "").toUpperCase() === "COMPLETED",
  ).length;
  const inProgressCount = bookings.filter(
    (b) => (b.status || "").toUpperCase() === "IN_PROGRESS",
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
      {/* ── Header Welcome ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold tracking-[0.16em] text-emerald-700 uppercase">
            Quản lý tư vấn
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Ca tư vấn bệnh nhân
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Theo dõi lịch hẹn, trao đổi trực tuyến và cập nhật phác đồ cho từng
            bệnh nhân.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="self-start rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 sm:self-auto"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Làm mới danh sách
        </Button>
      </div>

      {/* ── Top Stats Cards ── */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:h-11 sm:w-11">
            <Clock className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-500 sm:text-xs">
              Chờ xác nhận
            </p>
            <p className="text-xl font-bold text-slate-950 sm:text-2xl">
              {pendingCount}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
            <UserCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-500 sm:text-xs">
              Đã xác nhận
            </p>
            <p className="text-xl font-bold text-slate-950 sm:text-2xl">
              {confirmedCount}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:h-11 sm:w-11">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-500 sm:text-xs">
              Đã hoàn thành
            </p>
            <p className="text-xl font-bold text-slate-950 sm:text-2xl">
              {completedCount}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 sm:h-11 sm:w-11">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-slate-500 sm:text-xs">
              Tổng ca tư vấn
            </p>
            <p className="text-xl font-bold text-slate-950 sm:text-2xl">
              {bookings.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs sm:p-5">
        {/* Search & Tabs Filter Bar */}
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          {/* Tabs */}
          <div className="w-full overflow-x-auto pb-1 xl:w-auto xl:pb-0">
            <ToggleGroup
              multiple={false}
              value={[activeTab]}
              onValueChange={(value) =>
                value[0] && setActiveTab(value[0] as FilterTab)
              }
              variant="outline"
              size="sm"
              className="w-max bg-slate-50/70"
            >
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
                <ToggleGroupItem
                  key={tab.id}
                  value={tab.id}
                  className="h-9 px-3 text-xs data-pressed:bg-[#2C3E35] data-pressed:text-white"
                >
                  {tab.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Search Input */}
          <div className="relative w-full xl:w-80">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm theo khách hàng, triệu chứng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 rounded-xl border-slate-200 bg-white pl-9 text-xs"
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
                  className="grid gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 transition-all hover:border-emerald-200 hover:shadow-xs xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center"
                >
                  {/* Left: Info */}
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-slate-950">
                        {booking.customerName || "Khách hàng chưa cập nhật tên"}
                      </span>
                      {renderStatusBadge(booking)}
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

                    {/* Customer Feedback for Doctor */}
                    {booking.feedback && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 p-2 text-xs">
                        <span className="font-bold text-amber-800">
                          ⭐ Đánh giá từ bệnh nhân:
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= (booking.feedback?.rating || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-slate-200 text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        {booking.feedback.comment && (
                          <span className="text-[11px] font-semibold text-slate-700 italic">
                            &quot;{booking.feedback.comment}&quot;
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 xl:justify-end xl:border-t-0 xl:pt-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetailBookingId(booking.id)}
                      className="rounded-xl text-xs font-semibold text-slate-600"
                    >
                      <Info className="mr-1.5 h-3.5 w-3.5" /> Chi tiết
                    </Button>
                    {/* Action: Pending -> Confirm */}
                    {statusNorm === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          disabled={
                            confirmMutation.isPending ||
                            (!booking.isPaid && !booking.isFollowUp)
                          }
                          onClick={() => handleConfirm(booking.id)}
                          title={
                            !booking.isPaid && !booking.isFollowUp
                              ? "Chờ bệnh nhân thanh toán phí tư vấn qua ví trước khi duyệt"
                              : "Chấp nhận ca tư vấn"
                          }
                          className="rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {confirmMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                              {booking.isPaid || booking.isFollowUp
                                ? "Chấp Nhận"
                                : "Chờ BN Trả Ví"}
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
                    {statusNorm === "CONFIRMED" && (
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
                              Bắt đầu tư vấn
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenCancelModal(booking)}
                          className="rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Hủy ca
                        </Button>
                      </>
                    )}

                    {/* Action: Confirmed or In Progress -> Video Room */}
                    {(statusNorm === "CONFIRMED" ||
                      statusNorm === "IN_PROGRESS") && (
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(`/expert/consultations/${booking.id}`)
                        }
                        className="rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                      >
                        <Video className="mr-1.5 h-3.5 w-3.5" />
                        Phòng tư vấn
                      </Button>
                    )}

                    {/* Action: In Progress -> Create/Update Treatment Plan */}
                    {statusNorm === "IN_PROGRESS" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenTreatmentBuilder(booking)}
                        className="rounded-xl border-amber-300 bg-amber-50 text-xs font-bold text-amber-900 hover:bg-amber-100"
                      >
                        <FilePenLine className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
                        {booking.isFollowUp
                          ? "Xem và cập nhật phác đồ"
                          : "Lập phác đồ điều trị"}
                      </Button>
                    )}

                    {/* Action: In Progress -> Complete Consultation */}
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
                            Hoàn thành ca
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

      <Dialog
        open={Boolean(detailBookingId)}
        onOpenChange={(open) => !open && setDetailBookingId("")}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết ca tư vấn</DialogTitle>
            <DialogDescription>
              Thông tin được tải khi chuyên gia mở cửa sổ chi tiết.
            </DialogDescription>
          </DialogHeader>
          {detailBooking.isLoading ? (
            <div className="flex min-h-48 items-center justify-center text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải chi
              tiết...
            </div>
          ) : detailBooking.isError || !detailBooking.data ? (
            <p className="py-12 text-center text-sm text-red-600">
              Không thể tải chi tiết ca tư vấn.
            </p>
          ) : (
            <dl className="grid gap-4 border p-4 sm:grid-cols-2">
              <DetailItem
                label="Khách hàng"
                value={detailBooking.data.customerName || "Chưa cập nhật"}
              />
              <DetailItem
                label="Trạng thái"
                value={statusLabel(detailBooking.data.status)}
              />
              <DetailItem
                label="Thời gian"
                value={new Date(detailBooking.data.dateTime).toLocaleString(
                  "vi-VN",
                )}
              />
              <DetailItem
                label={
                  detailBooking.data.isFollowUp ? "Loại lịch" : "Thanh toán"
                }
                value={
                  detailBooking.data.isFollowUp
                    ? "Tái khám"
                    : detailBooking.data.isPaid
                      ? "Đã thanh toán"
                      : "Chưa thanh toán"
                }
              />
              <div className="sm:col-span-2">
                <DetailItem
                  label="Lý do tư vấn"
                  value={detailBooking.data.symptoms || "Không ghi nhận"}
                />
              </div>
              {detailBooking.data.cancelReason && (
                <div className="sm:col-span-2">
                  <DetailItem
                    label="Lý do hủy"
                    value={detailBooking.data.cancelReason}
                  />
                </div>
              )}
            </dl>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailBookingId("")}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function statusLabel(status: ConsultationBooking["status"]): string {
  return {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    in_progress: "Đang tư vấn",
    completed: "Đã hoàn thành",
    cancelled: "Đã hủy",
  }[status];
}

/**
 * Status Badge Renderer
 */
function renderStatusBadge(booking: ConsultationBooking) {
  const statusNorm = (booking.status || "").toUpperCase();

  if (booking.isFollowUp) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-300 bg-emerald-100 text-[10px] font-extrabold text-emerald-900"
      >
        Tái khám
      </Badge>
    );
  }

  switch (statusNorm) {
    case "PENDING":
      return booking.isPaid ? (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-[10px] font-bold text-blue-800"
        >
          Đã trả ví - Chờ duyệt
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-[10px] font-bold text-amber-800"
        >
          Chờ khách hàng trả ví
        </Badge>
      );
    case "CONFIRMED":
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
