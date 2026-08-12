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
      <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-16 text-center text-slate-500">
        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2C3E35] border-t-transparent"></div>
        <p className="text-xs font-medium">
          Đang xác thực phiên đăng nhập để mở hồ sơ chuyên gia...
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
        <Skeleton className="h-9 w-48 rounded-full bg-slate-200" />
        <Card className="overflow-hidden rounded-3xl border border-slate-200/90 shadow-xl">
          <div className="h-36 bg-gradient-to-r from-slate-200 to-slate-300 sm:h-44" />
          <CardHeader className="relative border-b border-slate-100 p-6 pt-0 sm:p-8">
            <div className="-mt-12 mb-2 flex flex-col items-start gap-4 sm:flex-row sm:items-end">
              <Skeleton className="h-24 w-24 shrink-0 rounded-3xl border-4 border-white sm:h-28 sm:w-28" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-5 w-24 rounded-full bg-slate-200" />
                <Skeleton className="h-8 w-64 rounded-xl bg-slate-200" />
                <Skeleton className="h-4 w-44 rounded-md bg-slate-200" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40 rounded-md bg-slate-200" />
              <Skeleton className="h-4 w-full rounded-md bg-slate-200" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-slate-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <Card className="mx-auto max-w-md p-8 shadow-sm">
          <p className="font-bold text-rose-600">{t.errorTitle}</p>
          <p className="mt-2 text-xs text-slate-500">{t.errorHint}</p>
          <div className="mt-6">
            <Link href="/experts">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs"
              >
                {t.backToList}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 md:py-12">
      {/* Back button link */}
      <div>
        <Link
          href="/experts"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-2xs transition-all hover:bg-slate-50 hover:text-[#2C3E35] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.back}</span>
        </Link>
      </div>

      {/* Main Expert Detail Card */}
      <Card className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900">
        {/* Header Decorative Banner */}
        <div className="relative h-36 w-full bg-gradient-to-r from-[#2C3E35] via-[#3A5246] to-teal-800 opacity-90 sm:h-44">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        </div>

        {/* Card Header & Profile Info */}
        <CardHeader className="relative border-b border-slate-100 p-6 pt-0 sm:p-8 dark:border-slate-800">
          <div className="-mt-12 mb-2 flex flex-col items-start gap-5 sm:-mt-14 sm:flex-row sm:items-end">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-slate-100 text-[#2C3E35] shadow-lg sm:h-28 sm:w-28 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-300">
              <User className="h-12 w-12 sm:h-14 sm:w-14" />
            </div>

            <div className="flex-1">
              <span className="inline-block rounded-full bg-[#E2EBE6] px-3 py-1 text-[11px] font-bold tracking-wider text-[#2C3E35] uppercase dark:bg-emerald-950 dark:text-emerald-300">
                {expert.title}
              </span>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                {expert.name}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>
                    {expert.rating} ({expert.reviews} đánh giá)
                  </span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {expert.distance} km
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Card Content Details */}
        <CardContent className="flex flex-col gap-8 p-6 sm:p-8">
          {/* Bio Section */}
          <div className="flex flex-col gap-2.5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>{t.introTitle}</span>
            </h3>
            <p className="text-xs leading-relaxed whitespace-pre-line text-slate-600 dark:text-slate-300">
              {expert.bio}
              {t.bioSuffix}
            </p>
          </div>

          {/* Specialties Section */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.specialtiesTitle}
            </h3>
            <div className="flex flex-wrap gap-2">
              {expert.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Clinic Section */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t.clinicTitle}
            </h3>
            <div className="flex items-start gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/50">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="leading-relaxed text-slate-700 dark:text-slate-300">
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {expert.clinic}
                </strong>
                {t.clinicSuffix}
              </span>
            </div>
          </div>

          {/* Quality Commitment Banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <span className="mb-0.5 block font-bold text-emerald-900 dark:text-emerald-200">
                {t.commitmentTitle}
              </span>
              {t.commitmentBody}
            </div>
          </div>
        </CardContent>

        {/* Footer Action Bar */}
        <CardFooter className="flex flex-col items-center justify-between gap-4 rounded-b-3xl border-t border-slate-100 bg-slate-50/80 p-6 sm:flex-row sm:p-8 dark:border-slate-800 dark:bg-slate-900/80">
          <div className="text-center sm:text-left">
            <span className="block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {t.feeLabel}
            </span>
            <span className="text-2xl font-extrabold text-[#2C3E35] dark:text-emerald-400">
              {formatVnd(expert.fee)}
            </span>
          </div>

          <Link href={`/booking/${expert.id}`} className="w-full sm:w-auto">
            <Button className="h-12 w-full rounded-2xl bg-[#2C3E35] px-8 text-sm font-bold text-white shadow-md transition-all hover:bg-[#3A5246] active:scale-95 sm:w-auto">
              <CalendarDays className="mr-2 h-4 w-4" />
              {t.book}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
