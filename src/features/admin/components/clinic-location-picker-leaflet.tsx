"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { ClinicCoordinate } from "./clinic-location-picker";

const DEFAULT_CENTER: ClinicCoordinate = { lat: 10.7769, lng: 106.7009 };
const markerIcon = L.divIcon({
  className: "clinic-location-picker-marker",
  html: '<span class="flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-lg text-white shadow-lg">●</span>',
  iconAnchor: [18, 18],
  iconSize: [36, 36],
});

function MapInteraction({
  value,
  onChange,
}: {
  value: ClinicCoordinate | null;
  onChange: (coordinate: ClinicCoordinate) => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (value) map.setView(value, 16);
  }, [map, value]);
  useMapEvents({
    click(event) {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export function ClinicLocationPickerLeaflet({
  value,
  onChange,
}: {
  value: ClinicCoordinate | null;
  onChange: (coordinate: ClinicCoordinate) => void;
}) {
  return (
    <MapContainer
      center={value ?? DEFAULT_CENTER}
      zoom={value ? 16 : 12}
      scrollWheelZoom
      className="h-72 w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <MapInteraction value={value} onChange={onChange} />
      {value ? (
        <Marker
          position={value}
          icon={markerIcon}
          draggable
          eventHandlers={{
            dragend(event) {
              const point = event.target.getLatLng();
              onChange({ lat: point.lat, lng: point.lng });
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
