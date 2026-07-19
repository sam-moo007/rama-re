"use client";

import type { PropertyDecisionRoom } from "@rama/contracts";
import { Captions, CircleHelp, Eye, Keyboard, Map, Save } from "lucide-react";
import { useState } from "react";

import dynamic from "next/dynamic";
import { localize, type Locale } from "@/lib/i18n";

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
    <div className="tourShell">
      <div className="tourScene">
        <div className="tourTopbar">
          <span><Eye aria-hidden="true" size={15} />{locale === "ar" ? "بانوراما الوحدة الفعلية" : "Exact-unit panorama"}</span>
          <span>{locale === "ar" ? "التقطت ١٥ يوليو ٢٠٢٦" : "Captured 15 Jul 2026"}</span>
        </div>
        <PanoramaViewer 
          activeRoomId={activeRoomId} 
          hotspots={activeRoom?.hotspots}
          locale={locale}
          onYawChange={setCurrentYaw}
        />
        <div className="tourActions">
          <button type="button" onClick={handleSaveViewpoint}><Save aria-hidden="true" size={16} />{locale === "ar" ? "حفظ زاوية العرض" : "Save viewpoint"}</button>
          <button type="button" onClick={handleAttachQuestion}><CircleHelp aria-hidden="true" size={16} />{locale === "ar" ? "إرفاق سؤال" : "Attach question"}</button>
        </div>
      </div>

      <aside className="planRail" aria-label={locale === "ar" ? "مخطط الغرف" : "Floor-plan rail"}>
        <div className="planHeading"><Map aria-hidden="true" size={17} /><strong>{locale === "ar" ? "المخطط + الغرف" : "Plan + rooms"}</strong></div>
        <div className="miniPlan" aria-hidden="true">
          <button type="button" className={`roomBlock living ${activeRoomId === "living" ? "active" : ""}`} onClick={() => setActiveRoomId("living")} aria-label="Living room" />
          <button type="button" className={`roomBlock kitchen ${activeRoomId === "kitchen" ? "active" : ""}`} onClick={() => setActiveRoomId("kitchen")} aria-label="Kitchen" />
          <button type="button" className={`roomBlock bedroom ${activeRoomId === "primary" ? "active" : ""}`} onClick={() => setActiveRoomId("primary")} aria-label="Primary bedroom" />
          <button type="button" className={`roomBlock balcony ${activeRoomId === "balcony" ? "active" : ""}`} onClick={() => setActiveRoomId("balcony")} aria-label="Balcony" />
        </div>
        <div className="roomList">
          {tour.rooms.map((room, index) => (
            <button
              aria-pressed={activeRoomId === room.id}
              className={activeRoomId === room.id ? "active" : ""}
              key={room.id}
              onClick={() => setActiveRoomId(room.id)}
              type="button"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{localize(room.label, locale)}</strong>
              <small>{room.evidenceCount} {locale === "ar" ? "أدلة" : "evidence"}</small>
            </button>
          ))}
        </div>
        <div className="tourAlternative">
          <span><Captions aria-hidden="true" size={17} />{locale === "ar" ? "صور مرتبة + نص وصفي" : "Ordered stills + transcript"}</span>
          <span><Keyboard aria-hidden="true" size={17} />{locale === "ar" ? "تشغيل كامل بلوحة المفاتيح" : "Full keyboard operation"}</span>
          <p>{locale === "ar" ? "البديل الأساسي متاح دون تحميل البانوراما أو العرض ثلاثي الأبعاد." : "The essential alternative works without loading panorama, 3D or XR."}</p>
        </div>
      </aside>
    </div>
  );
}
