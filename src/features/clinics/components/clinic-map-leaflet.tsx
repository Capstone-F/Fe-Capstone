"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { ExternalLink, Navigation } from "lucide-react";

export type ClinicMapLeafletProps = {
  latitude: number;
  longitude: number;
  clinicName: string;
  clinicAddress?: string | null;
};

function createClinicIcon() {
  return L.divIcon({
    className: "clinic-custom-marker",
    html: `
      <div style="
        background-color: #2C3E35;
        color: #ffffff;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(44, 62, 53, 0.4);
        border: 3px solid #ffffff;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export function ClinicMapLeaflet({
  latitude,
  longitude,
  clinicName,
  clinicAddress,
}: ClinicMapLeafletProps) {
  const position: [number, number] = [latitude, longitude];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-inner dark:border-slate-800">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full min-h-[320px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <RecenterMap lat={latitude} lng={longitude} />
        <Marker position={position} icon={createClinicIcon()}>
          <Popup className="clinic-popup">
            <div className="p-1">
              <p className="font-bold text-slate-900">{clinicName}</p>
              {clinicAddress && (
                <p className="mt-1 text-xs text-slate-600">{clinicAddress}</p>
              )}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                <Navigation className="h-3 w-3" /> Mở trong Google Maps
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating Action Badge */}
      <div className="absolute right-3 bottom-3 z-[400]">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-white/95 px-4 py-2 text-xs font-bold text-[#2C3E35] shadow-md backdrop-blur-xs transition-all hover:bg-white hover:shadow-lg dark:bg-slate-900/95 dark:text-emerald-400"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span>Mở Google Maps</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      </div>
    </div>
  );
}
