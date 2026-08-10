"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CalendarDays,
  Star,
  UserRound,
} from "lucide-react";

import { useExperts } from "@/features/experts/hooks/useExperts";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatVnd } from "@/shared/utils/format";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ExpertNetworkSection() {
  const expertsQuery = useExperts();
  const featuredExperts = expertsQuery.data?.slice(0, 3) ?? [];

  return (
    <section id="experts" className="border-border/40 border-t bg-white py-20">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-3">
            <span className="text-primary text-xs font-bold tracking-widest uppercase">
              Chuyên gia trên GlowScan
            </span>
            <h2 className="font-heading text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
              Hỗ trợ tư vấn hai cấp từ Chuyên gia Da liễu
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Chọn chuyên gia theo lĩnh vực, phòng khám và mức phí phù hợp. Mọi
              hồ sơ bên dưới được tải trực tiếp từ hệ thống GlowScan.
            </p>
          </div>
          <Link href="/experts" className="shrink-0">
            <Button
              variant="outline"
              className="border-border/80 gap-2 rounded-xl font-semibold"
            >
              Xem mạng lưới chuyên gia
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {expertsQuery.isLoading && (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="border-border/60 space-y-5 rounded-2xl border p-5"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        )}

        {expertsQuery.isError && (
          <div className="border-destructive/30 bg-destructive/5 text-destructive flex items-center gap-3 rounded-2xl border p-5 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>
              Chưa thể tải danh sách chuyên gia. Bạn vẫn có thể mở trang chuyên
              gia để thử lại.
            </p>
          </div>
        )}

        {!expertsQuery.isLoading &&
          !expertsQuery.isError &&
          featuredExperts.length === 0 && (
            <div className="border-border/60 text-muted-foreground flex flex-col items-center gap-3 rounded-2xl border p-8 text-center text-sm">
              <UserRound className="h-7 w-7" />
              <p>Hiện chưa có chuyên gia đang nhận lịch tư vấn.</p>
            </div>
          )}

        {featuredExperts.length > 0 && (
          <div className="grid gap-5 md:grid-cols-3">
            {featuredExperts.map((expert) => (
              <article
                key={expert.id}
                className="border-border/60 hover:border-primary/40 flex min-h-[300px] flex-col rounded-2xl border bg-white p-5 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold">
                    {getInitials(expert.name) || (
                      <UserRound className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-primary text-[10px] font-bold tracking-wide uppercase">
                      {expert.title}
                    </span>
                    <h3 className="font-heading text-foreground mt-1 line-clamp-2 text-lg font-bold">
                      {expert.name}
                    </h3>
                  </div>
                  {expert.rating > 0 && (
                    <span className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {expert.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="text-muted-foreground mt-5 space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="line-clamp-2">{expert.clinic}</span>
                  </div>
                  {expert.bio && (
                    <p className="line-clamp-3 leading-relaxed">{expert.bio}</p>
                  )}
                </div>

                <div className="border-border/50 mt-auto flex items-end justify-between gap-3 border-t pt-5">
                  <div>
                    <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                      Phí tư vấn
                    </span>
                    <span className="text-foreground text-sm font-bold">
                      {expert.fee > 0 ? formatVnd(expert.fee) : "Liên hệ"}
                    </span>
                  </div>
                  <Link href={`/experts/${expert.id}`}>
                    <Button size="sm" className="gap-1.5 rounded-xl text-xs">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Xem lịch
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
