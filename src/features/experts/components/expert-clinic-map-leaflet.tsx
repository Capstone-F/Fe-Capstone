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
import { ExternalLink, Navigation, X } from "lucide-react";
import type { Expert } from "../types/expert.types";
import type { Coordinate, ExpertClinicMapProps } from "./expert-clinic-map";
import { calculateHaversineDistanceKm } from "../lib/geo";

type ExpertMarker = { expert: Expert; position: Coordinate; rank: number };
const DEFAULT_CENTER: Coordinate = { lat: 10.7769, lng: 106.7009 };

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
    } else if (positions.length === 1) {
      map.setView(positions[0], 14);
    } else {
      map.fitBounds(
        L.latLngBounds(positions.map(({ lat, lng }) => [lat, lng])),
        { padding: [44, 44], maxZoom: 14 },
      );
    }
  }, [map, positions]);

  useEffect(() => {
    if (selectedPosition) {
      map.flyTo(selectedPosition, Math.max(map.getZoom(), 14), {
        duration: 0.45,
      });
    }
  }, [map, selectedPosition]);

  return null;
}

function buildDirectionsUrl(
  destination: Coordinate | string,
  origin: Coordinate | null,
) {
  const query = new URLSearchParams({
    api: "1",
    destination:
      typeof destination === "string"
        ? destination
        : `${destination.lat},${destination.lng}`,
    travelmode: "driving",
  });
  if (origin) query.set("origin", `${origin.lat},${origin.lng}`);
  return `https://www.google.com/maps/dir/?${query.toString()}`;
}

export function ExpertClinicMapLeaflet({
  experts,
  userLocation,
  selectedExpertId,
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
  const selectedMarker =
    markers.find(({ expert }) => expert.id === selectedExpertId) ?? null;
  const selectedExpert =
    experts.find((expert) => expert.id === selectedExpertId) ?? null;
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
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
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
              color: "#fff",
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
        {markers.map(({ expert, position, rank }) => (
          <Marker
            key={expert.id}
            position={position}
            icon={createRankIcon(rank, expert.id === selectedMarker?.expert.id)}
            eventHandlers={{ click: () => onSelectExpert(expert.id) }}
            title={`${expert.name} - ${expert.clinic}`}
          >
            <Tooltip direction="top" offset={[0, -18]}>
              {expert.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      {markers.length === 0 && (
        <div className="pointer-events-none absolute top-3 right-3 left-3 z-[500] rounded-lg border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow-sm">
          Phòng khám vẫn được hiển thị trong danh sách, nhưng chưa có tọa độ để
          đặt marker trên bản đồ.
        </div>
      )}

      {selectedExpert && (
        <div className="absolute right-3 bottom-7 left-3 z-[500] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950">
                {selectedExpert.clinicLocation?.name || selectedExpert.clinic}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {selectedExpert.clinicLocation?.address ||
                  "Chưa cập nhật địa chỉ phòng khám"}
              </p>
              <p className="mt-1 text-xs font-semibold text-blue-700">
                {!userLocation
                  ? "Chưa cấp GPS nên chưa thể tính khoảng cách."
                  : selectedDistance === null
                    ? "Phòng khám chưa có tọa độ để tính khoảng cách."
                    : `Cách bạn khoảng ${selectedDistance.toFixed(1)} km đường chim bay`}
              </p>
            </div>
            <button
              type="button"
              aria-label="Đóng thông tin phòng khám"
              onClick={() => onSelectExpert(null)}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 border-t pt-3">
            <a
              href={buildDirectionsUrl(
                selectedMarker?.position ??
                  selectedExpert.clinicLocation?.address ??
                  selectedExpert.clinic,
                userLocation,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
            >
              <Navigation className="h-3.5 w-3.5" /> Chỉ đường
              <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              href={`/experts/${selectedExpert.id}`}
              className="text-xs font-bold text-[#2C3E35] hover:underline"
            >
              Xem hồ sơ chuyên gia
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
