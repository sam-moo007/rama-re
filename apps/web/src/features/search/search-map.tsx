"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import type { PropertyCatalogueRecord } from "@rama/contracts";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Fix for default Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface SearchMapProps {
  properties: PropertyCatalogueRecord[];
  locale: "en" | "ar";
}

// Component to adjust bounds to fit all markers
function MapBounds({ properties }: { properties: PropertyCatalogueRecord[] }) {
  const map = useMap();
  useEffect(() => {
    const validCoords = properties
      .map(p => p.geo as { lat: number; lng: number } | null)
      .filter((geo): geo is { lat: number; lng: number } => geo !== null && typeof geo.lat === "number" && typeof geo.lng === "number");

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords.map(c => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [properties, map]);
  return null;
}

export function SearchMap({ properties, locale }: SearchMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [commuteMode, setCommuteMode] = useState<"drive" | "metro" | "walk">("drive");
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="w-full h-[600px] bg-muted animate-pulse rounded" />;
  }

  const getCommuteTime = (mode: string, baseDist: number) => {
    if (mode === "drive") return `${Math.round(baseDist * 15)} mins driving`;
    if (mode === "metro") return `${Math.round(baseDist * 25)} mins via Metro`;
    return `${Math.round(baseDist * 120)} mins walking`;
  };

  return (
    <div className="w-full h-[600px] rounded overflow-hidden border relative">
      {/* Commute Widget */}
      <div className="absolute top-4 right-4 z-[400] bg-white p-2 rounded shadow-md border flex gap-2">
        <button 
          onClick={() => setCommuteMode("drive")}
          className={`px-3 py-1 text-sm rounded ${commuteMode === "drive" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"}`}
        >
          {locale === "ar" ? "قيادة" : "Drive"}
        </button>
        <button 
          onClick={() => setCommuteMode("metro")}
          className={`px-3 py-1 text-sm rounded ${commuteMode === "metro" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"}`}
        >
          {locale === "ar" ? "مترو" : "Metro"}
        </button>
        <button 
          onClick={() => setCommuteMode("walk")}
          className={`px-3 py-1 text-sm rounded ${commuteMode === "walk" ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200"}`}
        >
          {locale === "ar" ? "مشي" : "Walk"}
        </button>
      </div>

      <MapContainer
        center={[25.2048, 55.2708]} // Default Dubai center
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapBounds properties={properties} />
        
        {properties.map((property, idx) => {
          const geo = property.geo as { lat: number; lng: number } | null;
          if (!geo || typeof geo.lat !== "number" || typeof geo.lng !== "number") return null;

          // Pseudo-distance from Downtown for simulation
          const distance = (geo.lat - 25.1972) ** 2 + (geo.lng - 55.2744) ** 2;
          const baseDist = Math.max(0.5, Math.sqrt(distance) * 100);

          return (
            <Marker key={property.id} position={[geo.lat, geo.lng]}>
              <Popup className="min-w-[200px]">
                <div className="flex flex-col gap-2 p-1">
                  <div className="font-semibold text-sm">
                    {typeof property.name === "string" ? property.name : (property.name as any)?.[locale]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {typeof property.community === "string" ? property.community : (property.community as any)?.[locale]}
                  </div>
                  
                  {/* Dynamic Commute Time */}
                  <div className="text-xs text-blue-600 font-medium bg-blue-50 p-1 rounded inline-block mt-1">
                    Downtown: {getCommuteTime(commuteMode, baseDist)}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold">AED {property.priceAed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    {property.bedrooms !== null && <span>{property.bedrooms} Bed</span>}
                    {property.bedrooms !== null && property.bathrooms !== null && <span>•</span>}
                    {property.bathrooms !== null && <span>{property.bathrooms} Bath</span>}
                  </div>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {property.sponsored && <Badge variant="secondary" className="text-[10px]">Sponsored</Badge>}
                    {property.decisionRoomAvailable && <Badge className="text-[10px] bg-primary text-primary-foreground">Decision Room</Badge>}
                  </div>
                  <Link 
                    href={`/${locale}/property/${property.slug}` as any}
                    className="mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
