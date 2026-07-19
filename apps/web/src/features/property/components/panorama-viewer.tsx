"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { TourHotspot } from "@rama/contracts";
import { Info, MessageCircleQuestion, Search } from "lucide-react";
import { localize, type Locale } from "@/lib/i18n";

type PanoramaViewerProps = {
  activeRoomId: string;
  imageUrl?: string;
  hotspots?: TourHotspot[];
  locale?: Locale;
  onYawChange?: (yaw: number) => void;
};

// Equirectangular panorama viewer implemented with CSS transforms — no external dependency
export default function PanoramaViewer({ activeRoomId, imageUrl, hotspots = [], locale = "en", onYawChange }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [yaw, setYaw] = useState(0); // degrees horizontal rotation
  const [dragging, setDragging] = useState(false);
  const lastX = useRef(0);

  // Reset yaw when room changes to simulate moving to a new viewpoint
  useEffect(() => {
    const newYaw = Math.floor(Math.random() * 360);
    setYaw(newYaw);
    onYawChange?.(newYaw);
  }, [activeRoomId, onYawChange]);

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
      const normalizedYaw = nextYaw < 0 ? nextYaw + 360 : nextYaw;
      onYawChange?.(normalizedYaw);
      return normalizedYaw;
    });
  }, [dragging, onYawChange]);

  const onPointerUp = useCallback(() => setDragging(false), []);

  const src = imageUrl ?? "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Dubai_Mall_-_Fountain_Plaza.jpg/1280px-Dubai_Mall_-_Fountain_Plaza.jpg";

  return (
    <div
      ref={containerRef}
      className="sceneDrawing dynamic-panorama"
      style={{ height: 380, width: "100%", overflow: "hidden", cursor: dragging ? "grabbing" : "grab", borderRadius: 8, position: "relative", userSelect: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      role="img"
      aria-label={`360° panorama view of room ${activeRoomId}`}
    >
      {/* Equirectangular strip — offset by yaw percentage */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: "200% 100%",
          backgroundPosition: `${((yaw % 360) + 360) % 360 / 360 * 100}% 50%`,
          backgroundRepeat: "repeat-x",
          transition: dragging ? "none" : "background-position 0.15s ease-out",
        }}
      />
      
      {/* Hotspots layer */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {hotspots.map((hotspot) => {
          let diff = (hotspot.yaw - yaw) % 360;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          
          // Only show hotspots that are within the current FOV (roughly +/- 90 degrees)
          // We add a little margin so they don't pop out abruptly.
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
                pointerEvents: "auto",
                backgroundColor: isQuestion ? "rgba(220, 38, 38, 0.9)" : isDetail ? "rgba(37, 99, 235, 0.9)" : "rgba(22, 163, 74, 0.9)",
                color: "white",
                border: "2px solid white",
                borderRadius: "20px",
                padding: "6px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                transition: "transform 0.1s ease-out",
                cursor: "pointer",
              }}
              onPointerDown={(e) => e.stopPropagation()} // prevent dragging the panorama
              onClick={() => alert(`Hotspot clicked: ${localize(hotspot.label, locale)}`)}
            >
              {isQuestion ? <MessageCircleQuestion size={14} /> : isDetail ? <Search size={14} /> : <Info size={14} />}
              <span style={{ whiteSpace: "nowrap" }}>{localize(hotspot.label, locale)}</span>
            </button>
          );
        })}
      </div>

      {/* Helper overlays */}
      <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 8, pointerEvents: "none" }}>
        <span style={{ background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 11, padding: "3px 8px", borderRadius: 4 }}>
          ↔ Drag to look around
        </span>
      </div>
    </div>
  );
}

