"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import type { Clinic } from "../types/clinic.types";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function ClinicInitialBadge({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] font-bold text-[#2C3E35] shadow-xs dark:bg-emerald-950/60 dark:text-emerald-300">
      <span className="text-sm tracking-wider">{initials || "PK"}</span>
    </div>
  );
}

export function ClinicCard({ clinic }: { clinic: Clinic }) {
  const hasCoords =
    clinic.latitude !== null &&
    clinic.longitude !== null &&
    Number.isFinite(clinic.latitude) &&
    Number.isFinite(clinic.longitude);

  return (
    <Link
      href={`/clinics/${clinic.id}`}
      className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2C3E35]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700/50"
    >
      <div className="flex items-start gap-3.5">
        <ClinicInitialBadge name={clinic.name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-900 transition-colors group-hover:text-[#2C3E35] dark:text-slate-100 dark:group-hover:text-emerald-400">
              {clinic.name}
            </h3>
          </div>

          {clinic.address ? (
            <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
              <p className="line-clamp-2 leading-relaxed">{clinic.address}</p>
            </div>
          ) : (
            <p className="mt-1.5 text-xs text-slate-400 italic">
              Chưa cập nhật địa chỉ
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          {hasCoords ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Có bản đồ GPS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Chưa có tọa độ
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-[#2C3E35] group-hover:underline dark:text-emerald-400">
          <span>Xem chi tiết</span>
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E2EBE6] text-[#2C3E35] transition-transform group-hover:translate-x-0.5 dark:bg-emerald-950 dark:text-emerald-300">
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ClinicCardSkeleton() {
  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-2/3 rounded-md" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>
    </div>
  );
}
