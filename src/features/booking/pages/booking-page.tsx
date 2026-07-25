"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  useSlots,
  useCreateBooking,
} from "@/features/booking/hooks/useBooking";
import { useExpertDetail } from "@/features/experts/hooks/useExperts";
import { useSession } from "@/features/auth/hooks/useSession";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { toast } from "sonner";
import type { TimeSlot } from "../types/booking.types";

export function BookSlotPage() {
  const params = useParams();
  const router = useRouter();
  const expertId = params?.expertId as string;

  const session = useSession();

  useEffect(() => {
    if (!session.isLoading && !session.data) {
      router.replace(
        `/login?redirectTo=${encodeURIComponent(`/booking/${expertId}`)}`,
      );
    }
  }, [session.isLoading, session.data, expertId, router]);

  const { data: expert, isLoading: isExpertLoading } =
    useExpertDetail(expertId);
  const { data: slots, isLoading: isSlotsLoading } = useSlots(expertId);
  const createBookingMutation = useCreateBooking();

  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  // Group slots by date
  const slotsByDate: Record<string, TimeSlot[]> = {};
  slots?.forEach((slot) => {
    const dateStr = slot.dateTime.split("T")[0];
    if (!slotsByDate[dateStr]) {
      slotsByDate[dateStr] = [];
    }
    slotsByDate[dateStr].push(slot);
  });

  const availableDates = Object.keys(slotsByDate).sort();
  const activeDateStr = selectedDateStr || availableDates[0] || "";

  const selectedSlot = slots?.find((s) => s.id === selectedSlotId);

  const formatDayName = (dateIso: string) => {
    const d = new Date(dateIso);
    return d.toLocaleDateString("vi-VN", { weekday: "short" });
  };

  const formatDateShort = (dateIso: string) => {
    const d = new Date(dateIso);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  };

  const formatDateFull = (dateIso: string) => {
    if (!dateIso) return "";
    const d = new Date(dateIso);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlotId || !selectedSlot) {
      toast.error("Vui lòng chọn một khung giờ hẹn.");
      return;
    }

    if (!symptoms.trim()) {
      toast.error("Vui lòng mô tả sơ bộ tình trạng da của bạn.");
      return;
    }

    if (!expert) return;

    try {
      const result = await createBookingMutation.mutateAsync({
        expertId: expert.id,
        expertName: expert.name,
        slotId: selectedSlot.id,
        dateTime: selectedSlot.dateTime,
        symptoms: symptoms,
        amount: expert.fee,
      });

      toast.success(
        "Khởi tạo cuộc hẹn thành công! Đang chuyển hướng sang thanh toán...",
      );
      router.push(`/booking/${expertId}/checkout?bookingId=${result.id}`);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo lịch hẹn.";
      toast.error(errMsg);
    }
  };

  if (isExpertLoading || isSlotsLoading || session.isLoading || !session.data) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center p-12 text-slate-500">
        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-b-transparent"></div>
        Đang nạp thông tin lịch tư vấn...
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="mx-auto max-w-2xl p-12 text-center text-slate-500">
        <p className="font-bold text-red-500">Không tìm thấy chuyên gia</p>
        <Link href="/experts" className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="rounded-xl">
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 py-4">
      <div>
        <Link
          href={`/experts/${expertId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang Chuyên gia
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl border-slate-200/80 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Đặt Lịch Hẹn Tư Vấn Chuyên Gia
                </CardTitle>
                <CardDescription className="mt-1 text-xs text-slate-500">
                  Hẹn tư vấn cùng Bác sĩ:{" "}
                  <strong className="font-semibold text-slate-900">
                    {expert.name}
                  </strong>{" "}
                  ({expert.title})
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800"
              >
                <Sparkles className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                {expert.clinic}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 p-6">
            {/* Step 1: Pick Date & Pop Down Time Slots */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <CalendarIcon className="h-4.5 w-4.5 text-emerald-600" />
                  1. Chọn Ngày Khám & Khung Giờ Mở
                </h3>
                {selectedSlot && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Đã chọn: {formatTime(selectedSlot.dateTime)} (
                    {formatDateShort(selectedSlot.dateTime)})
                  </span>
                )}
              </div>

              {availableDates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                  Hiện chưa có lịch khám trống khả dụng cho chuyên gia này. Vui
                  lòng thử lại sau.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Date Selector Row (Tabs / Scrollable Cards) */}
                  <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-2">
                    {availableDates.map((dateStr) => {
                      const isDateSelected = activeDateStr === dateStr;
                      const dateSlotsCount = slotsByDate[dateStr]?.length || 0;
                      const sampleSlotDate =
                        slotsByDate[dateStr]?.[0]?.dateTime ||
                        `${dateStr}T00:00:00.000Z`;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedDateStr(dateStr)}
                          className={`flex min-w-[105px] flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-200 select-none ${
                            isDateSelected
                              ? "border-emerald-600 bg-emerald-50/80 shadow-sm ring-2 ring-emerald-500/20"
                              : "border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-slate-50/80"
                          }`}
                        >
                          <span
                            className={`text-[11px] font-bold capitalize ${
                              isDateSelected
                                ? "text-emerald-800"
                                : "text-slate-500"
                            }`}
                          >
                            {formatDayName(sampleSlotDate)}
                          </span>
                          <span
                            className={`my-0.5 text-base font-extrabold ${
                              isDateSelected
                                ? "text-emerald-900"
                                : "text-slate-800"
                            }`}
                          >
                            {formatDateShort(sampleSlotDate)}
                          </span>
                          <span
                            className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              isDateSelected
                                ? "bg-emerald-200/70 font-bold text-emerald-900"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {dateSlotsCount} suất trống
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Pop Down Time Slots Grid for Selected Date */}
                  {activeDateStr && (
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all duration-300">
                      <div className="mb-3 flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-xs font-bold text-slate-800 capitalize">
                          📅 Khung giờ khám cho {formatDateFull(activeDateStr)}:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {(slotsByDate[activeDateStr] || []).length} ca khả
                          dụng
                        </span>
                      </div>

                      {(slotsByDate[activeDateStr] || []).length === 0 ? (
                        <p className="py-2 text-center text-xs text-slate-400">
                          Không có khung giờ khả dụng cho ngày này.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                          {(slotsByDate[activeDateStr] || []).map((slot) => {
                            const isSlotSelected = selectedSlotId === slot.id;
                            return (
                              <Button
                                key={slot.id}
                                type="button"
                                variant={
                                  isSlotSelected
                                    ? "default"
                                    : slot.isBooked
                                      ? "ghost"
                                      : "outline"
                                }
                                disabled={slot.isBooked}
                                onClick={() => setSelectedSlotId(slot.id)}
                                className={`h-11 rounded-xl px-3 text-xs font-bold transition-all ${
                                  slot.isBooked
                                    ? "cursor-not-allowed border-dashed bg-slate-100 text-slate-400 line-through"
                                    : isSlotSelected
                                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-500 hover:bg-emerald-50/40"
                                }`}
                              >
                                <Clock className="mr-1.5 h-3.5 w-3.5 opacity-70" />
                                {formatTime(slot.dateTime)}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Symptoms description */}
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FileText className="h-4.5 w-4.5 text-emerald-600" />
                2. Mô Tả Tình Trạng Da & Triệu Chứng
              </h3>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="symptoms"
                  className="text-xs font-medium text-slate-600"
                >
                  Ghi rõ các biểu hiện (như rát đỏ, mụn sưng, ngứa vùng má, dị
                  ứng mỹ phẩm...):
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Ví dụ: Da tôi bị nổi mụn đỏ sưng tấy 2 tuần nay sau khi đổi kem dưỡng mới. Vùng má rát đỏ nhẹ khi rửa mặt..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[100px] rounded-xl border-slate-200 text-xs leading-relaxed focus:border-emerald-500 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Notification reminder */}
            <div className="flex gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[11px] leading-relaxed text-amber-800">
                Sau khi bấm tiếp tục, ca hẹn của bạn sẽ tạm thời được giữ chỗ
                trong 10 phút để thực hiện thủ tục thanh toán. Lịch hẹn sẽ chính
                thức được kích hoạt sau khi hoàn tất thanh toán.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 p-6">
            <Link href={`/experts/${expertId}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 text-xs font-semibold text-slate-600"
              >
                Quay lại
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="rounded-xl bg-emerald-600 px-6 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
            >
              {createBookingMutation.isPending ? (
                "Đang xử lý..."
              ) : (
                <>
                  Tiếp Tục Thanh Toán
                  <ChevronRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
