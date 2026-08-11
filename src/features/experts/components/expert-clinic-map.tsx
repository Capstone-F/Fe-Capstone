"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MapPin, User, X } from "lucide-react";
import type { Expert } from "../types/expert.types";
import { formatVnd } from "@/shared/utils/format";

type Coordinate = {
  lat: number;
  lng: number;
};

type ExpertMarker = {
  expert: Expert;
  position: Coordinate;
  rank: number;
};

type ExpertClinicMapProps = {
  experts: Expert[];
  userLocation: Coordinate | null;
  selectedExpertId: string | null;
  hoveredExpertId: string | null;
  onSelectExpert: (expertId: string | null) => void;
};

const DEFAULT_CENTER: Coordinate = { lat: 10.7769, lng: 106.7009 };

function MapViewportController({
  positions,
  selectedPosition,
}: {
  positions: Coordinate[];
  selectedPosition: Coordinate | null;
}) {
  const map = useMap();
  const coreLibrary = useMapsLibrary("core");

  useEffect(() => {
    if (!map || !coreLibrary || positions.length === 0) return;

    if (positions.length === 1) {
      map.setCenter(positions[0]);
      map.setZoom(14);
      return;
    }

    const bounds = new coreLibrary.LatLngBounds();
    positions.forEach((position) => bounds.extend(position));
    map.fitBounds(bounds, 48);
  }, [coreLibrary, map, positions]);

  useEffect(() => {
    if (!map || !selectedPosition) return;

    map.panTo(selectedPosition);
    if ((map.getZoom() ?? 0) < 14) map.setZoom(14);
  }, [map, selectedPosition]);

  return null;
}

export function ExpertClinicMap({
  experts,
  userLocation,
  selectedExpertId,
  hoveredExpertId,
  onSelectExpert,
}: ExpertClinicMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  const markers = useMemo<ExpertMarker[]>(
    () =>
      experts.flatMap((expert, index) => {
        const clinic = expert.clinicLocation;
        if (
          !clinic ||
          clinic.latitude === null ||
          clinic.longitude === null ||
          !Number.isFinite(clinic.latitude) ||
          !Number.isFinite(clinic.longitude)
        ) {
          return [];
        }

        return [
          {
            expert,
            position: { lat: clinic.latitude, lng: clinic.longitude },
            rank: index + 1,
          },
        ];
      }),
    [experts],
  );

  const selectedMarker = markers.find(
    ({ expert }) => expert.id === selectedExpertId,
  );
  const selectedExpert = selectedMarker?.expert ?? null;
  const viewportPositions = useMemo(
    () => [
      ...markers.map(({ position }) => position),
      ...(userLocation ? [userLocation] : []),
    ],
    [markers, userLocation],
  );

  if (!apiKey || !mapId) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <MapPin className="mb-3 h-9 w-9 text-slate-400" />
        <p className="text-sm font-semibold text-slate-800">
          Bản đồ đang được cấu hình
        </p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
          Danh sách chuyên gia vẫn hoạt động. Cần cấu hình Google Maps API key
          và Map ID để hiển thị vị trí phòng khám.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey} language="vi" region="VN">
      <div className="relative h-full min-h-[420px] w-full">
        <Map
          defaultCenter={userLocation ?? markers[0]?.position ?? DEFAULT_CENTER}
          defaultZoom={12}
          mapId={mapId}
          gestureHandling="greedy"
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          reuseMaps
          className="h-full w-full"
        >
          <MapViewportController
            positions={viewportPositions}
            selectedPosition={selectedMarker?.position ?? null}
          />

          {userLocation && (
            <AdvancedMarker position={userLocation} title="Vị trí của bạn">
              <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md ring-4 ring-blue-500/20" />
            </AdvancedMarker>
          )}

          {markers.map(({ expert, position, rank }) => {
            const isActive =
              expert.id === selectedExpertId || expert.id === hoveredExpertId;

            return (
              <AdvancedMarker
                key={expert.id}
                position={position}
                title={`${expert.name} - ${expert.clinic}`}
                onClick={() => onSelectExpert(expert.id)}
              >
                <div
                  className={`flex h-9 min-w-9 items-center justify-center rounded-full border-2 border-white px-2 text-xs font-bold text-white shadow-md transition-transform ${
                    isActive
                      ? "scale-125 bg-[#2C3E35]"
                      : "bg-rose-500 hover:scale-110"
                  }`}
                >
                  {rank}
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>

        {markers.length === 0 && (
          <div className="pointer-events-none absolute top-3 right-3 left-3 rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow-sm">
            Chưa có phòng khám nào trong danh sách được cấu hình tọa độ.
          </div>
        )}

        {selectedExpert && (
          <div className="absolute right-3 bottom-3 left-3 z-10 flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <User className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-600 uppercase">
                    {selectedExpert.title}
                  </span>
                  <h5 className="mt-1 truncate text-sm font-bold text-slate-900">
                    {selectedExpert.name}
                  </h5>
                </div>
                <button
                  type="button"
                  aria-label="Đóng thông tin chuyên gia"
                  onClick={() => onSelectExpert(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {selectedExpert.clinicLocation?.address ||
                  selectedExpert.clinic}
              </p>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-xs font-extrabold text-slate-800">
                  {formatVnd(selectedExpert.fee)}
                </span>
                <Link
                  href={`/experts/${selectedExpert.id}`}
                  className="text-xs font-bold text-[#2C3E35] hover:underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </APIProvider>
  );
}
