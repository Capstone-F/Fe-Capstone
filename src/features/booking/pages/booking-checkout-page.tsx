"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Wallet as WalletIcon,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  BadgePercent,
  PlusCircle,
  CheckCircle2,
} from "lucide-react";
import { useBookingDetail } from "@/features/booking/hooks/useBooking";
import {
  useWallet,
  usePayConsultation,
} from "@/features/wallet/hooks/useWallet";
import { WalletTopUpModal } from "@/features/wallet/components/wallet-topup-modal";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { formatVnd } from "@/shared/utils/format";
import { toast } from "sonner";

function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams?.get("bookingId") as string;

  const { data: booking, isLoading, error } = useBookingDetail(bookingId);
  const { data: wallet, isLoading: isLoadingWallet } = useWallet();
  const payConsultationMutation = usePayConsultation();

  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
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

  const handleWalletPayment = async () => {
    if (!bookingId || !booking) return;

    const amount = booking.amount || 200000;
    const balance = wallet?.balanceVnd || 0;

    if (balance < amount) {
      toast.error(
        `Số dư ví không đủ. Vui lòng nạp thêm tối thiểu ${formatVnd(amount - balance)}`,
      );
      setTopUpModalOpen(true);
      return;
    }

    try {
      await payConsultationMutation.mutateAsync({
        consultationId: bookingId,
        amountVnd: amount,
      });

      toast.success("Thanh toán ca hẹn qua Ví GlowScan thành công! 🎉");
      router.push(`/booking/success?bookingId=${bookingId}`);
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : "Lỗi xử lý thanh toán qua ví.";
      toast.error(errMsg);
    }
  };

  if (isLoading || isLoadingWallet) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
        Đang nạp thông tin ví và hóa đơn...
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center text-slate-500">
        <p className="font-bold text-red-500">Hóa đơn không hợp lệ</p>
        <p className="mt-1 text-xs">
          Đường dẫn thanh toán thiếu bookingId hoặc đơn hẹn đã bị hủy.
        </p>
        <Link href="/experts" className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="rounded-xl">
            Quay lại
          </Button>
        </Link>
      </div>
    );
  }

  const consultationFee = booking.isFollowUp
    ? 0
    : booking.feeChargedVnd || booking.amount || 200000;
  const walletBalance = wallet?.balanceVnd || 0;
  const isBalanceEnough =
    booking.isFollowUp || booking.isPaid || walletBalance >= consultationFee;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div>
        <Link
          href={`/booking/${booking.expertId}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại đổi giờ tư vấn
        </Link>
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/60 p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
              <WalletIcon className="h-5 w-5 text-emerald-600" />
              Thanh Toán Lịch Khám Bằng Ví
            </CardTitle>
            <span className="animate-pulse rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">
              {formatCountdown(countdown)}
            </span>
          </div>
          <CardDescription className="mt-1 text-xs">
            Kiểm tra thông tin trước khi xác nhận thanh toán.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-6">
          {/* Booking Summary */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Chuyên gia tư vấn:</span>
              <span className="font-bold text-slate-900">
                {booking.expertName}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-slate-500">Thời gian hẹn:</span>
              <span className="font-bold text-slate-900">
                {formatTime(booking.dateTime)} - {formatDate(booking.dateTime)}
              </span>
            </div>
            {booking.symptoms && (
              <div className="mt-1 flex items-start justify-between">
                <span className="shrink-0 text-slate-500">Mối quan tâm:</span>
                <span className="max-w-[200px] truncate text-right text-slate-700 italic">
                  &quot;{booking.symptoms}&quot;
                </span>
              </div>
            )}
          </div>

          {/* Fee Calculation */}
          <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Phí tư vấn chuyên sâu</span>
              <span className="font-semibold text-slate-900">
                {formatVnd(consultationFee)}
              </span>
            </div>
            <div className="flex items-center justify-between text-emerald-600">
              <span className="flex items-center gap-1">
                <BadgePercent className="h-4 w-4" />
                Thanh toán qua Ví GlowScan
              </span>
              <span className="font-semibold">Miễn phí giao dịch</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-3 text-sm font-bold text-slate-900">
              <span>Tổng chi phí tư vấn</span>
              <span className="text-base text-emerald-700">
                {formatVnd(consultationFee)}
              </span>
            </div>
          </div>

          {/* Wallet Balance Status Card */}
          <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <WalletIcon className="h-4 w-4 text-emerald-600" />
                Số Dư Ví GlowScan:
              </span>
              <strong className="text-sm font-extrabold text-slate-900">
                {formatVnd(walletBalance)}
              </strong>
            </div>

            {isBalanceEnough ? (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Số dư khả dụng đủ để thanh toán ca hẹn.
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 pt-1">
                <span className="text-[11px] font-bold text-amber-700">
                  ⚠️ Còn thiếu {formatVnd(consultationFee - walletBalance)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTopUpModalOpen(true)}
                  className="rounded-lg border-emerald-200 bg-emerald-50 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                >
                  <PlusCircle className="mr-1 h-3.5 w-3.5" />
                  Nạp Tiền
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 p-6">
          <Button
            onClick={handleWalletPayment}
            disabled={payConsultationMutation.isPending || !isBalanceEnough}
            className="w-full rounded-xl bg-emerald-600 py-5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {payConsultationMutation.isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý trừ ví...
              </span>
            ) : (
              `Xác Nhận Trừ Ví ${formatVnd(consultationFee)}`
            )}
          </Button>

          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Thanh toán ví nội bộ an toàn & bảo mật bởi GlowScan
          </div>
        </CardFooter>
      </Card>

      <WalletTopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        requiredAmountVnd={consultationFee - walletBalance}
      />
    </div>
  );
}

export function BookingCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center p-12 text-slate-500">
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-emerald-600" />
          Đang chuẩn bị hóa đơn thanh toán...
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
