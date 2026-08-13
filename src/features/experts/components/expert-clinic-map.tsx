"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { Expert } from "../types/expert.types";

export type Coordinate = { lat: number; lng: number };

export type ExpertClinicMapProps = {
  experts: Expert[];
  userLocation: Coordinate | null;
  selectedExpertId: string | null;
  onSelectExpert: (expertId: string | null) => void;
};

const LeafletExpertClinicMap = dynamic(
  () =>
    import("./expert-clinic-map-leaflet").then(
      (module) => module.ExpertClinicMapLeaflet,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <MapPin className="mb-3 h-9 w-9 animate-pulse text-slate-400" />
        <p className="text-sm font-semibold text-slate-800">
          Đang tải bản đồ phòng khám...
        </p>
      </div>
    ),
  },
);

export function ExpertClinicMap(props: ExpertClinicMapProps) {
  return <LeafletExpertClinicMap {...props} />;
}
