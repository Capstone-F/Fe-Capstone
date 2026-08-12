"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { ExternalLink, Navigation, User, X } from "lucide-react";
import type { Expert } from "../types/expert.types";
import type { Coordinate, ExpertClinicMapProps } from "./expert-clinic-map";
import { formatVnd } from "@/shared/utils/format";
import { calculateHaversineDistanceKm } from "../lib/geo";

type ExpertMarker = {
  expert: Expert;
  position: Coordinate;
  rank: number;
};

const DEFAULT_CENTER: Coordinate = { lat: 10.7769, lng: 106.7009 };
const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

function createRankIcon(rank: number, isActive: boolean) {
  return L.divIcon({
    className: "expert-map-marker",
    html: `<span class="expert-map-marker__badge${isActive ? " expert-map-marker__badge--active" : ""}">${rank}</span>`,
    iconAnchor: [18, 18],
    iconSize: [36, 36],
  });
}

function MapViewportController({
  positions,
  selectedPosition,
}: {
  positions: Coordinate[];
  selectedPosition: Coordinate | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      map.setView(DEFAULT_CENTER, 12);
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }

    map.fitBounds(L.latLngBounds(positions.map(({ lat, lng }) => [lat, lng])), {
      padding: [44, 44],
      maxZoom: 14,
    });
  }, [map, positions]);

  useEffect(() => {
    if (!selectedPosition) return;
    map.flyTo(selectedPosition, Math.max(map.getZoom(), 14), {
      duration: 0.45,
    });
  }, [map, selectedPosition]);

  return null;
}

function buildDirectionsUrl(
  destination: Coordinate,
  origin: Coordinate | null,
) {
  const query = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });

  if (origin) {
    query.set("origin", `${origin.lat},${origin.lng}`);
  }

  return `https://www.google.com/maps/dir/?${query.toString()}`;
}

export function ExpertClinicMapLeaflet({
  experts,
  userLocation,
  selectedExpertId,
  hoveredExpertId,
  onSelectExpert,
}: ExpertClinicMapProps) {
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
  const selectedDistance =
    selectedMarker && userLocation
      ? calculateHaversineDistanceKm(userLocation, selectedMarker.position)
      : null;

  return (
    <div className="relative h-full min-h-[420px] w-full">
      <MapContainer
        center={userLocation ?? markers[0]?.position ?? DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={OSM_TILE_URL}
          maxZoom={19}
        />
        <MapViewportController
          positions={viewportPositions}
          selectedPosition={selectedMarker?.position ?? null}
        />

        {userLocation && (
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#2563eb",
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              Vị trí của bạn
            </Tooltip>
          </CircleMarker>
        )}

        {markers.map(({ expert, position, rank }) => {
          const isActive =
            expert.id === selectedExpertId || expert.id === hoveredExpertId;

          return (
            <Marker
              key={expert.id}
              position={position}
              icon={createRankIcon(rank, isActive)}
              eventHandlers={{
                click: () => onSelectExpert(expert.id),
              }}
              title={`${expert.name} - ${expert.clinic}`}
            >
              <Tooltip direction="top" offset={[0, -18]}>
                {expert.name}
              </Tooltip>
            </Marker>
          );
        })}
      </MapContainer>

      {markers.length === 0 && (
        <div className="pointer-events-none absolute top-3 right-3 left-3 z-[500] rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow-sm">
          Chưa có phòng khám nào trong danh sách được cấu hình tọa độ.
        </div>
      )}

      {selectedExpert && selectedMarker && (
        <div className="absolute right-3 bottom-7 left-3 z-[500] flex gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
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
              {selectedExpert.clinicLocation?.address || selectedExpert.clinic}
            </p>
            {selectedDistance !== null && (
              <p className="mt-1 text-[11px] font-semibold text-blue-700">
                Cách bạn khoảng {selectedDistance.toFixed(1)} km đường chim bay
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
              <span className="text-xs font-extrabold text-slate-800">
                {formatVnd(selectedExpert.fee)}
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={buildDirectionsUrl(
                    selectedMarker.position,
                    userLocation,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Chỉ đường
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Link
                  href={`/experts/${selectedExpert.id}`}
                  className="text-xs font-bold text-[#2C3E35] hover:underline"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
