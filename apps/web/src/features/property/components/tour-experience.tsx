"use client";

import type { PropertyDecisionRoom } from "@rama/contracts";
import { Captions, CircleHelp, Eye, Keyboard, Map, Save } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { localize, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PanoramaViewer = dynamic(
  () => import("./panorama-viewer"),
  { ssr: false }
);

type TourExperienceProps = {
  locale: Locale;
  tour: PropertyDecisionRoom["tour"];
};

export function TourExperience({ locale, tour }: TourExperienceProps) {
  const [activeRoomId, setActiveRoomId] = useState(tour.rooms[0]?.id ?? "");
  const [currentYaw, setCurrentYaw] = useState(0);
  const isAr = locale === "ar";
  const activeRoom = tour.rooms.find((room) => room.id === activeRoomId) ?? tour.rooms[0];

  const handleSaveViewpoint = () => {
    alert(`Viewpoint saved at yaw: ${Math.round(currentYaw)}° for ${activeRoom?.label ? localize(activeRoom.label, locale) : "unknown room"}`);
  };

  const handleAttachQuestion = () => {
    const question = prompt(`Attach a question for this viewpoint (${Math.round(currentYaw)}°):`);
    if (question) {
      alert(`Question attached: "${question}"`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-4">
      
      {/* Left / Main Column: 360° Panorama Viewer */}
      <div className="lg:col-span-8 space-y-3">
        
        {/* Viewer Topbar */}
        <Card className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-ink shadow-none rounded-b-none border-b-0">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-brand" />
            <span>{isAr ? "بانوراما الوحدة الفعلية (360°)" : "Exact-unit 360° Panorama"}</span>
          </div>
          <span className="font-mono text-muted text-[11px]">
            {isAr ? "التقطت ١٥ يوليو ٢٠٢٦" : "Captured 15 Jul 2026"}
          </span>
        </Card>

        {/* 360° Panorama Canvas */}
        <PanoramaViewer 
          activeRoomId={activeRoomId} 
          hotspots={activeRoom?.hotspots}
          locale={locale}
          onYawChange={setCurrentYaw}
        />

        {/* Viewpoint Action Buttons */}
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary"
            onClick={handleSaveViewpoint}
            className="flex-1 uppercase tracking-wider text-xs font-semibold h-11"
          >
            <Save className="size-4 me-1.5 text-brand" />
            {isAr ? "حفظ زاوية العرض" : "Save viewpoint"}
          </Button>

          <Button 
            variant="secondary"
            onClick={handleAttachQuestion}
            className="flex-1 uppercase tracking-wider text-xs font-semibold h-11"
          >
            <CircleHelp className="size-4 me-1.5 text-brand" />
            {isAr ? "إرفاق سؤال" : "Attach question"}
          </Button>
        </div>

      </div>

      {/* Right Column: Floorplan & Room Selector Rail */}
      <aside className="lg:col-span-4 space-y-4" aria-label={isAr ? "مخطط الغرف" : "Floor-plan rail"}>
        
        {/* Rail Box */}
        <Card className="p-5 space-y-4 shadow-none">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Map className="size-4 text-brand" />
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
              {isAr ? "المخطط والغرف" : "Plan & Rooms"}
            </h3>
          </div>

          {/* Interactive Mini Floorplan Grid */}
          <div className="grid grid-cols-2 gap-2 bg-surface-subtle p-2 border border-border rounded-md">
            {tour.rooms.map((room) => {
              const isActive = activeRoomId === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveRoomId(room.id)}
                  className={`p-3 text-start border transition-all cursor-pointer rounded-md ${
                    isActive
                      ? "bg-surface border-brand shadow-sm text-ink border-s-2"
                      : "bg-surface/50 border-border text-muted hover:border-brand/40 hover:text-text"
                  }`}
                >
                  <p className="text-[10px] font-mono font-bold">{room.id.toUpperCase()}</p>
                  <p className="text-xs font-semibold truncate">{localize(room.label, locale)}</p>
                </button>
              );
            })}
          </div>

          {/* Detailed Room List */}
          <div className="space-y-2 pt-1">
            {tour.rooms.map((room, index) => {
              const isActive = activeRoomId === room.id;
              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveRoomId(room.id)}
                  aria-pressed={isActive}
                  className={`w-full flex items-center justify-between p-3 border rounded-md text-start transition-all cursor-pointer ${
                    isActive
                      ? "bg-brand/5 border-brand shadow-sm text-ink"
                      : "bg-surface-subtle/50 border-border text-text hover:border-brand/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brand">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-xs font-semibold">{localize(room.label, locale)}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted bg-surface-subtle px-2 py-0.5 border border-border rounded-sm">
                    {room.evidenceCount} {isAr ? "أدلة" : "evidence"}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Accessibility & Alternative Format Notice */}
        <Card className="bg-surface-subtle p-4 space-y-2 text-xs text-text shadow-none border-border">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <Captions className="size-4 text-brand" />
            <span>{isAr ? "صور مرتبة + نص وصفي" : "Ordered Stills + Transcript"}</span>
          </div>
          <div className="flex items-center gap-2 font-semibold text-ink">
            <Keyboard className="size-4 text-brand" />
            <span>{isAr ? "تشغيل كامل بلوحة المفاتيح" : "Full Keyboard Operation"}</span>
          </div>
          <p className="text-[11px] text-muted leading-relaxed pt-1">
            {isAr
              ? "البديل الأساسي متاح دون الحاجة لتحميل البانوراما أو العناصر ثلاثية الأبعاد."
              : "The essential alternative works without loading panorama or 3D visuals."}
          </p>
        </Card>

      </aside>

    </div>
  );
}
