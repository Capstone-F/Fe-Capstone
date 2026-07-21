"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  BadgePercent,
} from "lucide-react";
import {
  useBookingDetail,
  useUpdatePaymentStatus,
} from "@/features/booking/hooks/use-booking";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { toast } from "sonner";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams?.get("bookingId") as string;

  const { data: booking, isLoading, error } = useBookingDetail(bookingId);
  const updatePaymentStatusMutation = useUpdatePaymentStatus();

  const [countdown, setCountdown] = useState(600);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

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

  const handlePayment = async () => {
    if (!bookingId) return;

    try {
      await updatePaymentStatusMutation.mutateAsync({
        bookingId,
        status: "paid",
      });

      toast.success("Thanh toán thành công qua cổng VNPay giả lập!");
      router.push(`/booking/success?bookingId=${bookingId}`);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Lỗi xử lý thanh toán.";
      toast.error(errMsg);
    }
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground mx-auto flex max-w-lg flex-col items-center justify-center p-12">
        <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        Đang chuẩn bị hóa đơn thanh toán...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="text-muted-foreground mx-auto max-w-lg p-12 text-center">
        <p className="font-bold text-red-500">Hóa đơn không hợp lệ</p>
        <p className="mt-1 text-sm">
          Đường dẫn thanh toán thiếu bookingId hoặc đơn hẹn đã bị hủy.
        </p>
        <Link href="/experts" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div>
        <Link
          href={`/booking/${booking.expertId}`}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đổi giờ tư vấn
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1.5 text-base font-bold text-slate-900">
              <CreditCard className="text-primary h-4 w-4" />
              Hóa đơn dịch vụ tư vấn
            </CardTitle>
            <span className="animate-pulse rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {formatCountdown(countdown)}
            </span>
          </div>
          <CardDescription className="mt-1 text-xs">
            Mã đơn hẹn:{" "}
            <span className="font-semibold text-slate-700">{booking.id}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200/50 bg-slate-100/50 p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Chuyên gia tư vấn:</span>
              <span className="font-bold text-slate-800">
                {booking.expertName}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-muted-foreground">Thời gian hẹn:</span>
              <span className="font-bold text-slate-800">
                {formatTime(booking.dateTime)} - {formatDate(booking.dateTime)}
              </span>
            </div>
            <div className="mt-1.5 flex items-start justify-between">
              <span className="text-muted-foreground shrink-0">
                Mối quan tâm về da:
              </span>
              <span className="max-w-[200px] truncate text-right text-slate-600">
                {booking.symptoms}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span>Phí tư vấn chuyên sâu</span>
              <span>{booking.amount.toLocaleString("vi-VN")} đ</span>
            </div>
            <div className="flex items-center justify-between text-green-600">
              <span className="flex items-center gap-1">
                <BadgePercent className="h-4 w-4" />
                Mã giảm giá GlowScan
              </span>
              <span>-0 đ</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
              <span>Tổng số tiền phải thanh toán</span>
              <span className="text-primary">
                {booking.amount.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-4 shadow-inner">
            <div className="text-muted-foreground flex h-32 w-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-2 text-center text-[10px]">
              [ MOCK QR CODE VNPAY PAYMENT ]
            </div>
            <span className="text-muted-foreground text-[9px]">
              Quét mã bằng app ngân hàng hoặc bấm nút phía dưới để giả lập.
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 p-6">
          <Button
            onClick={handlePayment}
            disabled={updatePaymentStatusMutation.isPending}
            className="shadow-primary/10 w-full rounded-xl py-5 font-bold shadow-lg"
          >
            {updatePaymentStatusMutation.isPending ? (
              <span className="flex items-center gap-1">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Đang xác thực giao dịch...
              </span>
            ) : (
              "Thanh toán thành công (VNPay)"
            )}
          </Button>
          <div className="text-muted-foreground flex items-center justify-center gap-1 text-[10px]">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Giao dịch được bảo mật bởi VNPay & GlowScan
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export function BookingCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground mx-auto flex max-w-lg flex-col items-center justify-center p-12">
          <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          Đang chuẩn bị hóa đơn thanh toán...
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
