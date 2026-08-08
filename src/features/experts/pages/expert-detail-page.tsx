"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MapPin,
  ShieldCheck,
  Heart,
  User,
  CalendarDays,
} from "lucide-react";
import { useExpertDetail } from "@/features/experts/hooks/useExperts";
import { useSession } from "@/features/auth/hooks/useSession";
import { Button } from "@/shared/components/ui/button";
import { formatVnd } from "@/shared/utils/format";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useEffect } from "react";

export function ExpertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const session = useSession();
  const {
    data: expert,
    isLoading,
    error,
  } = useExpertDetail(id, Boolean(session.data));
  const t = {
    back: "Quay lại danh sách chuyên gia",
    errorTitle: "Đã xảy ra lỗi",
    errorHint:
      "Không thể tải thông tin chuyên gia. Hồ sơ có thể không tồn tại hoặc đường dẫn bị sai.",
    backToList: "Quay lại danh sách",
    introTitle: "Giới thiệu chuyên gia",
    bioSuffix:
      " Chuyên gia luôn ưu tiên thiết kế các quy trình chăm sóc da đơn giản, an toàn và cá nhân hóa tối đa cho làn da người Việt Nam.",
    specialtiesTitle: "Lĩnh vực chuyên sâu",
    clinicTitle: "Nơi công tác & Đối tác",
    clinicSuffix: " (Được trang bị máy soi da chuyên dụng GlowScan Pro)",
    commitmentTitle: "Cam kết chất lượng tư vấn",
    commitmentBody:
      "Tất cả chuyên gia thuộc mạng lưới GlowScan đều được xác minh chứng chỉ hành nghề da liễu thẩm mỹ và có ít nhất 3 năm kinh nghiệm chuyên sâu.",
    feeLabel: "Chi phí tư vấn dự kiến",
    book: "Đặt lịch hẹn ngay",
  };

  useEffect(() => {
    if (!session.isLoading && !session.data) {
      router.replace(
        `/login?redirectTo=${encodeURIComponent(`/experts/${id}`)}`,
      );
    }
  }, [id, router, session.data, session.isLoading]);

  if (session.isLoading || !session.data) {
    return (
      <div className="text-muted-foreground mx-auto flex max-w-2xl flex-col items-center justify-center p-12 text-center">
        <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        Đang xác thực phiên đăng nhập để mở hồ sơ chuyên gia...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Skeleton className="h-4 w-40 bg-slate-300" />
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="from-primary/30 h-28 bg-gradient-to-r to-blue-500/10" />
          <CardHeader className="relative border-b border-slate-100 p-6 pt-0">
            <div className="-mt-10 mb-2 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <Skeleton className="h-20 w-20 shrink-0 rounded-2xl border-4 border-white" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-24 bg-slate-300" />
                <Skeleton className="h-6 w-48 bg-slate-300" />
                <Skeleton className="h-3.5 w-40 bg-slate-300" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32 bg-slate-300" />
              <Skeleton className="h-3 w-full bg-slate-300" />
              <Skeleton className="h-3 w-5/6 bg-slate-300" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Skeleton className="h-6 w-20 bg-slate-300" />
              <Skeleton className="h-6 w-24 bg-slate-300" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-6 sm:flex-row">
            <Skeleton className="h-8 w-32 bg-slate-300" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="text-muted-foreground mx-auto max-w-2xl p-12 text-center">
        <p className="font-bold text-red-500">{t.errorTitle}</p>
        <p className="mt-1 text-sm">{t.errorHint}</p>
        <Link href="/experts" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            {t.backToList}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* Back button */}
      <div>
        <Link
          href="/experts"
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-xs transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {/* Header Cover Background */}
        <div className="from-primary/30 h-28 bg-gradient-to-r to-blue-500/10" />

        <CardHeader className="relative border-b border-slate-100 p-6 pt-0">
          {/* Mock Avatar placement */}
          <div className="-mt-10 mb-2 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-slate-100 text-slate-400 shadow-md">
              <User className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <span className="text-primary bg-primary/10 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                {expert.title}
              </span>
              <h2 className="mt-1.5 text-xl font-bold text-slate-900">
                {expert.name}
              </h2>
              <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-0.5 font-semibold text-yellow-600">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>
                    {expert.rating} ({expert.reviews} đánh giá)
                  </span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {expert.distance} km
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-6 p-6">
          {/* Bio section */}
          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Heart className="h-4 w-4 fill-current text-red-500" />
              {t.introTitle}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
              {expert.bio}
              {t.bioSuffix}
            </p>
          </div>

          {/* Specialties Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              {t.specialtiesTitle}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {expert.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Clinic Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-800">
              {t.clinicTitle}
            </h3>
            <p className="text-muted-foreground flex items-start gap-1.5 text-xs">
              <MapPin className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {expert.clinic}
                {t.clinicSuffix}
              </span>
            </p>
          </div>

          {/* Flow note */}
          <div className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <ShieldCheck className="text-primary h-5 w-5 shrink-0" />
            <div className="text-[11px] leading-normal text-slate-700">
              <span className="block font-bold text-blue-900">
                {t.commitmentTitle}
              </span>
              {t.commitmentBody}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 bg-slate-50 p-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
              {t.feeLabel}
            </span>
            <span className="text-primary text-xl font-bold">
              {formatVnd(expert.fee)}
            </span>
          </div>
          <Link href={`/booking/${expert.id}`} className="w-full sm:w-auto">
            <Button className="shadow-primary/20 w-full rounded-xl px-6 py-5 font-bold shadow-lg sm:w-auto">
              <CalendarDays className="mr-2 h-4 w-4" />
              {t.book}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
