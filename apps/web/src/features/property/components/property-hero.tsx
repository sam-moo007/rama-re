"use client";

import type { PropertyDecisionRoom } from "@rama/contracts";
import {
  ArrowLeftRight,
  Bookmark,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircleMore,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { formatAed, formatDate } from "@/lib/format";
import { copy, localize, type Locale } from "@/lib/i18n";

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
  const isAr = locale === "ar";
  const gallery = GALLERY[property.slug] ?? DEFAULT_GALLERY;
  const activeImage = gallery[activeIdx] || DEFAULT_GALLERY[0]!;

  const verifiedCount = property.claims.filter((c) => c.status === "verified").length;

  return (
    <section className="py-8 lg:py-12 border-b border-border" aria-labelledby="property-title">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Property Summary & Specs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-brand font-semibold tracking-wider uppercase">
              <MapPin className="size-3.5 shrink-0" />
              <span>{localize(property.community, locale)}</span>
            </div>
            
            <h1 id="property-title" className="text-3xl sm:text-4xl font-serif text-ink tracking-tight font-light leading-tight">
              {localize(property.name, locale)}
            </h1>

            <p className="text-2xl font-mono font-bold text-ink pt-1">
              {formatAed(property.priceAed, locale)}
            </p>
          </div>

          {/* DLD Verification Box */}
          <Card className="bg-surface-subtle p-4 space-y-2 shadow-none border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink text-xs font-semibold">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>{isAr ? "سجل التحقق الرسمي" : "RAMA Verified Ledger"}</span>
              </div>
              <span className="text-[10px] font-semibold text-brand bg-brand/10 px-2 py-0.5 border border-brand/20">
                {verifiedCount}/{property.claims.length} {isAr ? "حقائق موثقة" : "Facts Confirmed"}
              </span>
            </div>
            <p className="text-xs text-text leading-relaxed">
              {isAr
                ? "تمت مطابقة سند الملكية وحساب الضمان ومساحة البناء مع سجلات دائرة الأراضي والأملاك."
                : "Title deed, escrow account, and building area cross-checked with official Dubai Land Dept ledgers."}
            </p>
          </Card>

          {/* Key Fit Reasons */}
          <div className="space-y-3 pt-1">
            <p className="text-xs uppercase tracking-widest font-semibold text-muted">
              {text.fit}
            </p>
            <ul className="space-y-2 text-xs text-text">
              {property.fitReasons.map((reason) => (
                <li key={reason.en} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{localize(reason, locale)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <Button render={<a href="#advisor" />} className="flex-1 text-xs uppercase tracking-wider font-bold h-12">
              <MessageCircleMore className="size-4 me-2 shrink-0" />
              <span>{isAr ? "التحقق من التوفر" : "Check availability"}</span>
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 text-ink hover:text-brand"
              aria-label={text.save}
            >
              <Bookmark className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-12 w-12 text-ink hover:text-brand"
              aria-label={text.compare}
            >
              <ArrowLeftRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Right Column: Sharp Framed Gallery */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative w-full h-[400px] lg:h-[460px] overflow-hidden border border-border shadow-md rounded-none group bg-surface">
            <Image
              key={activeImage.src}
              src={activeImage.src}
              alt={`${activeImage.label[locale]} — ${localize(property.name, locale)}`}
              fill
              priority={activeIdx === 0}
              quality={90}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-4 start-4 bg-surface/90 backdrop-blur-sm px-3 py-1.5 border border-border text-ink text-[11px] font-medium tracking-wide">
              {activeImage.label[locale]}
            </div>

            <div className="absolute bottom-4 start-4 bg-surface/90 backdrop-blur-sm px-3 py-1.5 border border-border text-text text-[10px] uppercase font-mono tracking-wider flex items-center gap-2">
              <Clock className="size-3 text-brand" />
              <span>{isAr ? "تم التصوير" : "Captured"} {formatDate(property.media.capturedAt, locale)}</span>
            </div>
          </div>

          {/* Thumbnail Selector Rail */}
          <div className="grid grid-cols-4 gap-3">
            {gallery.map((item, i) => (
              <button
                key={item.src}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={`p-2 border text-start transition-all cursor-pointer ${
                  i === activeIdx
                    ? "bg-surface border-brand shadow-sm text-ink border-s-2"
                    : "bg-surface-subtle border-border text-muted hover:border-brand/40 hover:text-text"
                }`}
              >
                <p className="text-[10px] font-mono font-bold">0{i + 1}</p>
                <p className="text-[11px] font-medium truncate">{item.label[locale]}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
