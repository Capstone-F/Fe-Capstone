"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  MapPin,
  Navigation,
  RotateCw,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { useClinicDetail, useClinicExperts } from "../hooks/useClinics";
import { ClinicMapView } from "../components/clinic-map-view";
import { ClinicInitialBadge } from "../components/clinic-card";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatVnd } from "@/shared/utils/format";
import type { BackendExpert } from "@/features/experts/types/expert.types";

const SPECIALTY_LABELS: Record<string, string> = {
  DERMATOLOGY: "Da liễu",
  DERMATOLOGIST: "Bác sĩ Da liễu",
  COSMETIC_DERMATOLOGY: "Da liễu thẩm mỹ",
  ACNE_TREATMENT: "Điều trị mụn",
  ANTI_AGING: "Chống lão hóa",
  PIGMENTATION: "Sắc tố da",
  LASER_THERAPY: "Laser trị liệu",
  AESTHETIC_MEDICINE: "Thẩm mỹ y khoa",
};

function ExpertRow({ expert }: { expert: BackendExpert }) {
  const specialtyLabel =
    SPECIALTY_LABELS[expert.specialization] ?? expert.specialization;

  const initials = (expert.name ?? "BS")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs transition-all hover:border-[#2C3E35]/30 hover:shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E2EBE6] font-bold text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-300">
          <span className="text-xs">{initials || "BS"}</span>
        </div>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
            {expert.name ?? "Bác sĩ Da liễu"}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {specialtyLabel}
          </p>
          <div className="mt-1 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{Number(expert.rating ?? 5).toFixed(1)}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Phí tư vấn: {formatVnd(Number(expert.consultationFee ?? 0))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/booking?expertId=${expert.id}`}>
          <Button
            size="sm"
            className="h-8 rounded-xl bg-[#2C3E35] px-3.5 text-xs font-bold text-white hover:bg-[#3A5246]"
          >
            <Calendar className="mr-1.5 h-3 w-3" /> Đặt lịch
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ClinicDetailPage({ clinicId }: { clinicId: string }) {
  const {
    data: clinic,
    isLoading: isClinicLoading,
    isError: isClinicError,
    error: clinicError,
    refetch: refetchClinic,
  } = useClinicDetail(clinicId);

  const { data: expertsData, isLoading: isExpertsLoading } =
    useClinicExperts(clinicId);
  const experts = expertsData?.items || [];

  if (isClinicLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <Skeleton className="h-6 w-32 rounded-md" />
        <Skeleton className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isClinicError || !clinic) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          <Building2 className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">
          Không tìm thấy phòng khám
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {(clinicError as Error)?.message ||
            "Phòng khám này không tồn tại hoặc đã tạm dừng hoạt động."}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchClinic()}
            className="rounded-xl text-xs"
          >
            <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Thử lại
          </Button>
          <Link href="/clinics">
            <Button
              size="sm"
              className="rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
            >
              Về danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const googleMapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    clinic.latitude && clinic.longitude
      ? `${clinic.latitude},${clinic.longitude}`
      : `${clinic.name}, ${clinic.address ?? ""}`,
  )}`;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Back Navigation */}
      <div>
        <Link
          href="/clinics"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#2C3E35] dark:text-slate-400 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Danh sách phòng khám</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <ClinicInitialBadge name={clinic.name} />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#E2EBE6] px-3 py-0.5 text-xs font-bold text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-300">
                  Phòng khám đối tác
                </span>
                {clinic.isActive && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Đang hoạt động
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
                {clinic.name}
              </h1>

              {clinic.address ? (
                <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="leading-relaxed">{clinic.address}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Chưa cập nhật địa chỉ
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <a
              href={googleMapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#2C3E35] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#3A5246] active:scale-95"
            >
              <Navigation className="h-4 w-4" />
              <span>Chỉ đường</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Experts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Map Section (7 cols) */}
        <div className="space-y-3 lg:col-span-7">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-300">
              <MapPin className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Vị trí trên bản đồ
            </h3>
          </div>

          <div className="h-[360px] w-full">
            <ClinicMapView
              latitude={clinic.latitude}
              longitude={clinic.longitude}
              clinicName={clinic.name}
              clinicAddress={clinic.address}
            />
          </div>
        </div>

        {/* Experts Section (5 cols) */}
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-300">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Đội ngũ Bác sĩ / Chuyên gia
              </h3>
            </div>
            {!isExpertsLoading && experts.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {experts.length} chuyên gia
              </span>
            )}
          </div>

          {isExpertsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : experts.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <Stethoscope className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                Chưa có thông tin chuyên gia
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Danh sách bác sĩ tại phòng khám này sẽ được cập nhật sớm.
              </p>
            </div>
          ) : (
            <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
              {experts.map((exp) => (
                <ExpertRow key={exp.id} expert={exp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
