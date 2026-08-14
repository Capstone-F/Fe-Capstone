"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

export type ClinicCoordinate = { lat: number; lng: number };

const PickerMap = dynamic(
  () =>
    import("./clinic-location-picker-leaflet").then(
      (module) => module.ClinicLocationPickerLeaflet,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-100 text-xs text-slate-500">
        <MapPin className="mr-2 h-4 w-4 animate-pulse" /> Đang tải bản đồ...
      </div>
    ),
  },
);

export function ClinicLocationPicker(props: {
  value: ClinicCoordinate | null;
  onChange: (coordinate: ClinicCoordinate) => void;
}) {
  return <PickerMap {...props} />;
}
