"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Home,
} from "lucide-react";
import { useBookingDetail } from "@/features/booking/hooks/use-booking";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams?.get("bookingId") as string;

  const { data: booking, isLoading } = useBookingDetail(bookingId);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
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

  if (isLoading) {
    return (
      <div className="text-muted-foreground mx-auto flex max-w-md flex-col items-center justify-center p-12">
        <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        Đang đồng bộ hóa đơn lịch tư vấn...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-6">
      <Card className="overflow-hidden border-slate-200 text-center shadow-md">
        {/* Confetti gradient header */}
        <div className="via-primary h-3 bg-gradient-to-r from-green-400 to-blue-500" />

        <CardHeader className="p-6 pb-2">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-500">
            <CheckCircle2 className="h-10 w-10 rounded-full bg-white fill-current text-green-500" />
          </div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Đặt lịch hẹn thành công!
          </CardTitle>
          <CardDescription className="text-xs">
            Hệ thống đã ghi nhận thanh toán phí tư vấn chuyên sâu của bạn.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-6 pt-2 text-left">
          {booking ? (
            <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-200/50 pb-2">
                <User className="text-primary h-4 w-4 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                    Chuyên gia phụ trách
                  </span>
                  <span className="font-bold text-slate-800">
                    {booking.expertName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-slate-200/50 pb-2">
                <Calendar className="text-primary h-4 w-4 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                    Ngày tư vấn
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatDate(booking.dateTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-primary h-4 w-4 shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[9px] font-semibold uppercase">
                    Giờ tư vấn (Online)
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatTime(booking.dateTime)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center text-xs">
              Không thể tải thông tin cuộc hẹn.
            </p>
          )}

          <div className="text-muted-foreground text-center text-[10px] leading-normal">
            💡 <strong>Hướng dẫn tham gia cuộc hẹn:</strong> Chuyên gia sẽ liên
            hệ trực tiếp với bạn qua cuộc gọi video tích hợp trên ứng dụng
            GlowScan đúng vào khung giờ trên. Vui lòng kiểm tra kết nối mạng
            trước 5 phút.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-6 sm:flex-row">
          <Link href="/appointments" className="w-full">
            <Button className="w-full rounded-xl text-xs font-semibold">
              Quản lý cuộc hẹn của tôi
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="w-full rounded-xl text-xs font-semibold"
            >
              <Home className="mr-1.5 h-3.5 w-3.5" />
              Trang chủ
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground mx-auto flex max-w-md flex-col items-center justify-center p-12">
          <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          Đang đồng bộ hóa đơn lịch tư vấn...
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
