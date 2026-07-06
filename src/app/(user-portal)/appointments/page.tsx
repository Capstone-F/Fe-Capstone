"use client";

import React from "react";
import Link from "next/link";
import {
  Calendar,
  User,
  CreditCard,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import { useBookings } from "@/features/booking/hooks/use-booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppointmentsPage() {
  const { data: bookings, isLoading } = useBookings();

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
            Đã thanh toán
          </span>
        );
      case "confirmed":
        return (
          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            Đã xác nhận
          </span>
        );
      case "cancelled":
        return (
          <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
            Đã hủy
          </span>
        );
      case "pending":
      default:
        return (
          <span className="animate-pulse rounded-md bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
            Chờ thanh toán
          </span>
        );
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Lịch hẹn tư vấn của tôi
        </h2>
        <p className="text-muted-foreground text-sm">
          Xem và quản lý các lượt tư vấn trực tiếp cùng bác sĩ chuyên khoa da
          liễu.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={index}
              className="overflow-hidden border-slate-200 shadow-xs"
            >
              <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <Skeleton className="h-3.5 w-40 bg-slate-300" />
                <Skeleton className="h-4 w-24 bg-slate-300" />
              </div>
              <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-12">
                <div className="flex items-center gap-2.5 md:col-span-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-2.5 w-24 bg-slate-300" />
                    <Skeleton className="h-4 w-28 bg-slate-300" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 md:col-span-4">
                  <Skeleton className="h-5 w-5 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-2.5 w-20 bg-slate-300" />
                    <Skeleton className="h-3.5 w-32 bg-slate-300" />
                  </div>
                </div>
                <div className="flex items-center gap-2.5 md:col-span-2">
                  <Skeleton className="h-5 w-5 shrink-0" />
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-2.5 w-16 bg-slate-300" />
                    <Skeleton className="h-3.5 w-16 bg-slate-300" />
                  </div>
                </div>
                <div className="flex items-center justify-end md:col-span-2">
                  <Skeleton className="h-8 w-24 rounded-lg" />
                </div>
              </CardContent>
              <div className="flex gap-2 border-t border-slate-100/50 bg-slate-50/10 px-4 py-2">
                <Skeleton className="mt-0.5 h-4 w-4 shrink-0" />
                <Skeleton className="h-3.5 w-3/4 bg-slate-300" />
              </div>
            </Card>
          ))}
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {bookings.map((bk) => (
            <Card
              key={bk.id}
              className="hover:border-slate-350 overflow-hidden border-slate-200 shadow-xs transition-colors"
            >
              <div className="flex flex-col items-start justify-between gap-2 border-b border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[10px]">
                    Mã cuộc hẹn:
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {bk.id}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-[10px]">
                    Đặt lúc:{" "}
                    {new Date(bk.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  {getStatusBadge(bk.status)}
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
                      Chuyên gia phụ trách
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
                      Thời gian hẹn
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
                      Phí dịch vụ
                    </span>
                    <span className="block text-xs font-bold text-slate-700">
                      {bk.amount.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end md:col-span-2">
                  {bk.status === "pending" ? (
                    <Link
                      href={`/booking/${bk.expertId}/checkout?bookingId=${bk.id}`}
                    >
                      <Button
                        size="sm"
                        className="rounded-lg bg-yellow-600 text-xs font-semibold hover:bg-yellow-700"
                      >
                        Thanh toán ngay
                      </Button>
                    </Link>
                  ) : bk.status === "paid" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-default rounded-lg border-green-200 text-xs font-semibold text-green-700 hover:bg-green-50/50"
                    >
                      Chờ gọi khám
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled
                      className="rounded-lg text-xs font-semibold"
                    >
                      Hoàn thành
                    </Button>
                  )}
                </div>
              </CardContent>

              {/* Symptoms collapse */}
              <div className="flex gap-2 border-t border-slate-100/50 bg-slate-50/10 px-4 py-2 text-xs text-slate-600">
                <MessageSquare className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                <div className="leading-normal italic">
                  <strong className="text-slate-700 not-italic">
                    Triệu chứng khai báo:
                  </strong>{" "}
                  {bk.symptoms}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-muted-foreground flex flex-col items-center justify-center rounded-2xl border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <ShieldAlert className="text-slate-355 mb-3 h-12 w-12" />
          <p className="font-bold text-slate-700">Chưa có lịch hẹn nào</p>
          <p className="mt-1 text-xs">
            Lịch sử đặt khám trực tiếp cùng chuyên gia da liễu sẽ hiển thị tại
            đây.
          </p>
          <Link href="/experts" className="mt-4 inline-block">
            <Button size="sm" className="rounded-xl text-xs font-semibold">
              Tìm bác sĩ đặt lịch ngay
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
