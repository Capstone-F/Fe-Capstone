"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  useSlots,
  useCreateBooking,
} from "@/features/booking/hooks/use-booking";
import { useExpertDetail } from "@/features/experts/hooks/use-experts";
import { useSession } from "@/features/auth/hooks/use-session";
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
import { toast } from "sonner";

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

  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string>("");

  const selectedSlot = slots?.find((s) => s.id === selectedSlotId);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const slotsByDate: Record<string, typeof slots> = {};
  slots?.forEach((slot) => {
    const dateStr = slot.dateTime.split("T")[0];
    if (!slotsByDate[dateStr]) {
      slotsByDate[dateStr] = [];
    }
    slotsByDate[dateStr]?.push(slot);
  });

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
      <div className="text-muted-foreground mx-auto flex max-w-2xl flex-col items-center justify-center p-12">
        <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        Đang tải thông tin lịch tư vấn...
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="text-muted-foreground mx-auto max-w-2xl p-12 text-center">
        <p className="font-bold text-red-500">Không tìm thấy chuyên gia</p>
        <Link href="/experts" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <div>
        <Link
          href={`/experts/${expertId}`}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chuyên gia
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
            <CardTitle className="text-lg font-bold text-slate-900">
              Đặt lịch hẹn tư vấn
            </CardTitle>
            <CardDescription className="text-xs">
              Hẹn tư vấn cùng Chuyên gia:{" "}
              <strong className="text-slate-800">{expert.name}</strong> (
              {expert.title})
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 p-6">
            {/* Step 1: Pick Slot */}
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Calendar className="text-primary h-4 w-4" />
                1. Chọn ngày và giờ hẹn
              </h3>

              {Object.keys(slotsByDate).length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Không có lịch trống khả dụng.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {Object.entries(slotsByDate).map(([dateStr, dateSlots]) => (
                    <div key={dateStr} className="flex flex-col gap-2">
                      <span className="w-fit rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-bold text-slate-700 capitalize">
                        {formatDate(dateSlots?.[0]?.dateTime || "")}
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {dateSlots?.map((slot) => {
                          const isSelected = selectedSlotId === slot.id;
                          return (
                            <Button
                              key={slot.id}
                              type="button"
                              variant={
                                isSelected
                                  ? "default"
                                  : slot.isBooked
                                    ? "ghost"
                                    : "outline"
                              }
                              disabled={slot.isBooked}
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`h-9 rounded-lg px-2 text-xs ${
                                slot.isBooked
                                  ? "cursor-not-allowed border-dashed bg-slate-100 text-slate-400 line-through"
                                  : isSelected
                                    ? "shadow-primary/20 shadow-sm"
                                    : "hover:border-primary/45"
                              }`}
                            >
                              <Clock className="mr-1 h-3 w-3 opacity-70" />
                              {formatTime(slot.dateTime)}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Symptoms description */}
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <FileText className="text-primary h-4 w-4" />
                2. Mô tả tình trạng da và mối quan tâm của bạn
              </h3>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="symptoms" className="text-xs text-slate-600">
                  Hãy ghi rõ các biểu hiện (như rát đỏ, mụn sưng, ngứa vùng má,
                  dị ứng mỹ phẩm cũ...):
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Ví dụ: Da tôi bị nổi mụn đỏ sưng tấy 2 tuần nay sau khi đổi kem dưỡng mới. Vùng má rát đỏ nhẹ khi rửa mặt..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-[100px] text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Notification reminder */}
            <div className="flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
              <p className="text-muted-foreground text-[10px] leading-normal">
                Sau khi bấm gửi thông tin, lịch hẹn của bạn sẽ tạm thời được giữ
                trong vòng 10 phút để thực hiện thủ tục thanh toán chi phí tư
                vấn. Lịch hẹn chỉ có hiệu lực chính thức sau khi hệ thống xác
                nhận thanh toán thành công.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-6">
            <Link href={`/experts/${expertId}`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg text-xs font-semibold"
              >
                Quay lại
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={createBookingMutation.isPending}
              className="shadow-primary/10 rounded-lg px-5 text-xs font-semibold shadow-md"
            >
              {createBookingMutation.isPending
                ? "Đang xử lý..."
                : "Tiếp tục thanh toán"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
