"use client";

import dynamic from "next/dynamic";
import { ExternalLink, MapPin, Navigation } from "lucide-react";

const LeafletClinicMap = dynamic(
  () =>
    import("./clinic-map-leaflet").then((module) => module.ClinicMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <MapPin className="mb-2 h-8 w-8 animate-pulse text-[#2C3E35] dark:text-emerald-400" />
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          Đang tải bản đồ phòng khám...
        </p>
      </div>
    ),
  },
);

export type ClinicMapViewProps = {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  clinicName: string;
  clinicAddress?: string | null;
};

export function ClinicMapView({
  latitude,
  longitude,
  clinicName,
  clinicAddress,
}: ClinicMapViewProps) {
  const hasCoordinates =
    latitude !== null &&
    latitude !== undefined &&
    longitude !== null &&
    longitude !== undefined &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  if (!hasCoordinates) {
    return (
      <div className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
          <MapPin className="h-6 w-6" />
        </div>
        <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
          Chưa có thông tin định vị GPS
        </h4>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Phòng khám chưa cập nhật tọa độ trên bản đồ. Quý khách vui lòng di
          chuyển theo địa chỉ bên trên để tới phòng khám.
        </p>
        {clinicAddress && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${clinicName}, ${clinicAddress}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Navigation className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tìm kiếm theo tên trên Google Maps</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        )}
      </div>
    );
  }

  return (
    <LeafletClinicMap
      latitude={Number(latitude)}
      longitude={Number(longitude)}
      clinicName={clinicName}
      clinicAddress={clinicAddress}
    />
  );
}
