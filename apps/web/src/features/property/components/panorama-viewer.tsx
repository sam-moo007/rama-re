"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { TourHotspot } from "@rama/contracts";
import { Compass, Info, MessageCircleQuestion, Search } from "lucide-react";
import { localize, type Locale } from "@/lib/i18n";

type PanoramaViewerProps = {
  activeRoomId: string;
  imageUrl?: string;
  hotspots?: TourHotspot[];
  locale?: Locale;
  onYawChange?: (yaw: number) => void;
};

// Equirectangular 360° panorama viewer with sharp Nordic styling & zero rounded corners
export default function PanoramaViewer({ activeRoomId, imageUrl, hotspots = [], locale = "en", onYawChange }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [yaw, setYaw] = useState(0); // degrees horizontal rotation
  const [dragging, setDragging] = useState(false);
  const lastX = useRef(0);

  const isAr = locale === "ar";

  // Reset yaw when room changes to simulate moving to a new viewpoint
  useEffect(() => {
    const newYaw = Math.floor(Math.random() * 360);
    setYaw(newYaw);
  }, [activeRoomId]);

  // Notify parent of yaw updates safely outside of render phase
  useEffect(() => {
    onYawChange?.(yaw);
  }, [yaw, onYawChange]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setDragging(true);
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setYaw((y) => {
      const nextYaw = (y + dx * 0.3) % 360;
      return nextYaw < 0 ? nextYaw + 360 : nextYaw;
    });
  }, [dragging]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  const src = imageUrl ?? "/images/property-living-room.jpg";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] border border-border shadow-md rounded-none overflow-hidden select-none bg-[#171717]"
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="img"
      aria-label={`360° panorama view of room ${activeRoomId}`}
    >
      {/* Equirectangular strip — offset by yaw percentage */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "200% 100%",
          backgroundPosition: `${((yaw % 360) + 360) % 360 / 360 * 100}% 50%`,
          backgroundRepeat: "repeat-x",
          transition: dragging ? "none" : "background-position 0.15s ease-out",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

      {/* Hotspots layer */}
      <div className="absolute inset-0 pointer-events-none">
        {hotspots.map((hotspot) => {
          let diff = (hotspot.yaw - yaw) % 360;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          
          if (diff < -100 || diff > 100) return null;

          const leftPos = 50 + (diff / 90) * 50;
          const topPos = 50 - (hotspot.pitch / 90) * 50;
          
          const isDetail = hotspot.type === "detail";
          const isQuestion = hotspot.type === "question";

          return (
            <button
              key={hotspot.id}
              type="button"
              title={localize(hotspot.label, locale)}
              style={{
                position: "absolute",
                left: `${leftPos}%`,
                top: `${topPos}%`,
                transform: "translate(-50%, -50%)",
              }}
              className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white border shadow-lg transition-transform hover:scale-105 cursor-pointer rounded-none font-mono ${
                isQuestion 
                  ? "bg-red-800/90 border-red-400" 
                  : isDetail 
                  ? "bg-brand/90 border-brand-soft" 
                  : "bg-emerald-800/90 border-emerald-400"
              }`}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => alert(`Hotspot clicked: ${localize(hotspot.label, locale)}`)}
            >
              {isQuestion ? <MessageCircleQuestion className="size-3.5" /> : isDetail ? <Search className="size-3.5" /> : <Info className="size-3.5" />}
              <span className="whitespace-nowrap">{localize(hotspot.label, locale)}</span>
            </button>
          );
        })}
      </div>

      {/* Angle Telemetry Badge */}
      <div className="absolute top-4 end-4 bg-black/75 backdrop-blur-md px-3 py-1.5 border border-white/20 text-white text-xs font-mono flex items-center gap-2 pointer-events-none">
        <Compass className="size-3.5 text-brand" />
        <span>Yaw: {Math.round(yaw)}°</span>
      </div>

      {/* Drag Helper Overlay */}
      <div className="absolute bottom-4 start-4 bg-black/75 backdrop-blur-md px-3 py-1 border border-white/20 text-[#B5B0A8] text-[11px] font-mono uppercase tracking-wider pointer-events-none">
        {isAr ? "↔ اسحب للتدوير 360°" : "↔ Drag to rotate 360°"}
      </div>
    </div>
  );
}
