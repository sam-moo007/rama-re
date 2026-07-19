"use client";

import type { PropertyDecisionRoom } from "@rama/contracts";
import {
  ArrowLeftRight,
  Bookmark,
  Check,
  CircleDashed,
  Clock3,
  MapPin,
  MessageCircleMore,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatAed, formatDate } from "@/lib/format";
import { copy, localize, type Locale } from "@/lib/i18n";

// Maps slugs → gallery images (all from /public/images)
const GALLERY: Record<string, { src: string; label: { en: string; ar: string } }[]> = {
  "residence-1204": [
    { src: "/images/property-living-room.jpg", label: { en: "Living Room", ar: "غرفة المعيشة" } },
    { src: "/images/property-kitchen.jpg", label: { en: "Kitchen", ar: "المطبخ" } },
    { src: "/images/property-master-bedroom.jpg", label: { en: "Bedroom", ar: "غرفة النوم" } },
    { src: "/images/property-pool-terrace.jpg", label: { en: "Amenities", ar: "المرافق" } },
  ],
  "marina-penthouse-5401": [
    { src: "/images/property-marina-penthouse.jpg", label: { en: "Penthouse View", ar: "إطلالة البنتهاوس" } },
    { src: "/images/property-living-room.jpg", label: { en: "Living Area", ar: "غرفة المعيشة" } },
    { src: "/images/property-master-bedroom.jpg", label: { en: "Master Suite", ar: "الجناح الرئيسي" } },
    { src: "/images/community-marina.jpg", label: { en: "Community", ar: "المجتمع" } },
  ],
  "downtown-penthouse-ph03": [
    { src: "/images/property-downtown-exterior.jpg", label: { en: "Exterior", ar: "المبنى" } },
    { src: "/images/property-living-room.jpg", label: { en: "Great Room", ar: "الغرفة الكبرى" } },
    { src: "/images/property-pool-terrace.jpg", label: { en: "Rooftop Pool", ar: "مسبح السطح" } },
    { src: "/images/community-downtown.jpg", label: { en: "Downtown", ar: "وسط المدينة" } },
  ],
};

const DEFAULT_GALLERY = [
  { src: "/images/property-living-room.jpg", label: { en: "Living Room", ar: "غرفة المعيشة" } },
  { src: "/images/property-kitchen.jpg", label: { en: "Kitchen", ar: "المطبخ" } },
  { src: "/images/property-master-bedroom.jpg", label: { en: "Bedroom", ar: "غرفة النوم" } },
  { src: "/images/property-pool-terrace.jpg", label: { en: "Amenities", ar: "المرافق" } },
];

type PropertyHeroProps = {
  locale: Locale;
  property: PropertyDecisionRoom;
};

export function PropertyHero({ locale, property }: PropertyHeroProps) {
  const text = copy[locale];
  const [activeIdx, setActiveIdx] = useState(0);
  const gallery = GALLERY[property.slug] ?? DEFAULT_GALLERY;
  const activeImage = gallery[activeIdx] || DEFAULT_GALLERY[0]!;

  return (
    <section className="propertyHero" aria-labelledby="property-title">
      {/* Media column */}
      <div className="propertyMedia" aria-label={locale === "ar" ? "وسائط الوحدة الفعلية" : "Exact-unit media"}>
        <div className="mediaMetaRow">
          <Badge className="representationBadge" variant="outline">
            <Check aria-hidden="true" size={14} />
            {locale === "ar" ? "الوحدة الفعلية" : "Exact unit"}
          </Badge>
          <span className="captureDate">
            <Clock3 aria-hidden="true" size={14} />
            {locale === "ar" ? "تم التصوير" : "Captured"} {formatDate(property.media.capturedAt, locale)}
          </span>
        </div>

        {/* Main image */}
        <div className="architecturalView group" style={{ background: "#1a1e1b", position: "relative" }}>
          <Image
            key={activeImage.src}
            src={activeImage.src}
            alt={`${activeImage.label[locale]} — ${localize(property.name, locale)}`}
            fill
            priority={activeIdx === 0}
            quality={90}
            style={{ objectFit: "cover" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 40%)",
              pointerEvents: "none",
            }}
          />
          
          {/* Interactive 360 Viewer Sync */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
            <button 
              type="button"
              className="bg-black/60 hover:bg-blue-600 text-white backdrop-blur-sm rounded px-4 py-2 flex items-center gap-2 transition-all transform hover:scale-105"
              onClick={() => setActiveIdx((prev) => (prev + 1) % gallery.length)}
              aria-label="Rotate 360 View"
            >
              <ArrowLeftRight size={16} />
              {locale === "ar" ? "تدوير العرض والتزامن" : "Rotate 360 & Sync"}
            </button>
          </div>

          <div className="viewCaption" style={{ color: "#f0ece3", background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.2)" }}>
            {activeImage.label[locale]}
          </div>
        </div>

        {/* Thumbnail rail */}
        <div className="mediaRail" aria-label={locale === "ar" ? "طرق العرض" : "Media views"}>
          {gallery.map((item, i) => (
            <button
              key={item.src}
              className={`mediaThumb${i === activeIdx ? " active" : ""}`}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`${locale === "ar" ? "عرض" : "View"} ${item.label[locale]}`}
              aria-current={i === activeIdx ? "true" : undefined}
            >
              0{i + 1} <span>{item.label[locale]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Summary column */}
      <div className="heroSummary">
        <p className="eyebrow">RAMA / PROPERTY DECISION RECORD</p>
        <div className="locationLine">
          <MapPin aria-hidden="true" size={15} strokeWidth={1.6} />
          {localize(property.community, locale)}
        </div>
        <h1 id="property-title">{localize(property.name, locale)}</h1>
        <p className="propertyPrice">{formatAed(property.priceAed, locale)}</p>

        <div className="coverageBlock">
          <div className="coverageHeading">
            <span><strong>{property.evidenceCoverage}%</strong> {text.evidenceComplete}</span>
            <span className="evidenceState"><span aria-hidden="true" /> {locale === "ar" ? "منشور" : "Published"}</span>
          </div>
          <Progress className="ramaProgress" value={property.evidenceCoverage} aria-label={`${property.evidenceCoverage}% ${text.evidenceComplete}`} />
          <p>{text.evidenceDisclaimer}</p>
        </div>

        <div className="fitSnapshot">
          <h2>{text.fit}</h2>
          <ul>
            {property.fitReasons.map((reason) => (
              <li key={reason.en}>
                <Check aria-hidden="true" size={17} />
                <span>{localize(reason, locale)}</span>
              </li>
            ))}
          </ul>
          <div className="uncertainConstraint">
            <CircleDashed aria-hidden="true" size={18} />
            <span><strong>{text.uncertain}</strong>{localize(property.uncertainConstraint, locale)}</span>
          </div>
        </div>

        <div className="heroActions">
          <a className="askButton" href="#advisor">
            <MessageCircleMore aria-hidden="true" size={18} />
            {text.ask}
          </a>
          <Button className="secondaryButton" size="lg" variant="outline" type="button">
            <Bookmark aria-hidden="true" size={17} />{text.save}
          </Button>
          <Button className="secondaryButton" size="lg" variant="outline" type="button">
            <ArrowLeftRight aria-hidden="true" size={17} />{text.compare}
          </Button>
        </div>
      </div>
    </section>
  );
}
