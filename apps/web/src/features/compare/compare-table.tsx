"use client";

import React from "react";
import Image from "next/image";
import type { PropertySearchResultItem } from "@rama/contracts";

import { localize, type Locale } from "@/lib/i18n";
import { formatAed } from "@/lib/format";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CheckCircle2, ShieldCheck, HelpCircle, Minus, Ruler, BedDouble, Bath } from "lucide-react";
import { MagicCard } from "@/components/ui/magic-card";

interface CompareTableProps {
  properties: PropertySearchResultItem[];
  locale: Locale;
}

const PROPERTY_IMAGES: Record<string, string> = {
  "residence-1204": "/images/property-downtown-exterior.jpg",
  "marina-penthouse-5401": "/images/property-marina-penthouse.jpg",
  "downtown-penthouse-ph03": "/images/property-living-room.jpg",
  "garden-court-805-demo": "/images/property-kitchen.jpg",
  "marina-home-demo": "/images/property-pool-terrace.jpg",
  "canal-loft-demo": "/images/property-master-bedroom.jpg",
  "palm-villa-b7": "/images/community-palm.jpg",
};

const DEFAULT_PROPERTY_IMAGE = "/images/property-downtown-exterior.jpg";

export function CompareTable({ properties, locale }: CompareTableProps) {
  const isRtl = locale === "ar";

  if (properties.length === 0) {
    return null;
  }

  // Highlight logic for price & fit
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  const maxPrice = Math.max(...properties.map(p => p.priceAed));
  const minPrice = Math.min(...properties.map(p => p.priceAed));
  const maxFit = Math.max(...properties.map(p => p.fitScore));

  return (
    <div className="reveal-up delay-200">
      <ScrollArea className="w-full whitespace-nowrap bg-[var(--surface)] border border-[var(--line)] shadow-sm" dir={isRtl ? "rtl" : "ltr"}>
        <div className="min-w-max p-6 pb-8">
          {/* Header Row — Cards */}
          <div className="flex gap-6 mb-8">
            <div className="w-[200px] shrink-0 sticky left-0 z-10 bg-[var(--surface)]" /> {/* Spacing for sticky labels */}
{/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {properties.map((property, idx) => {
              const imageSrc = PROPERTY_IMAGES[property.slug] ?? DEFAULT_PROPERTY_IMAGE;
              return (
                <MagicCard key={property.id} className="w-[320px] shrink-0 space-y-4 p-4 rounded-none" gradientColor="var(--copper-tint)">
                  <div className="relative aspect-[4/3] w-full overflow-hidden border border-[var(--line-strong)] group">
                    <Image
                      src={imageSrc}
                      alt={localize(property.name, locale)}
                      fill
                      sizes="320px"
                      className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-3 start-3">
                      <span className="trust-badge shadow-sm">
                        <span className={`size-1.5 rounded-full ${property.tenure === 'off_plan' ? 'bg-[var(--ochre)]' : 'bg-[var(--sage)]'}`}></span>
                        {property.tenure === "off_plan" ? (isRtl ? "قيد الإنشاء" : "Off-plan") : (isRtl ? "جاهز" : "Ready")}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--copper-dark)] font-bold mb-1.5">
                      {localize(property.community, locale)}
                    </p>
                    <h3 className="font-serif text-xl font-medium text-[var(--ink)] leading-snug whitespace-normal line-clamp-2">
                      {localize(property.name, locale)}
                    </h3>
                  </div>
                </MagicCard>
              );
            })}
          </div>

          {/* Data Rows */}
          <div className="space-y-0">
            {/* PRICE */}
            <div className="flex gap-6 border-t border-[var(--line)] py-5 hover:bg-[var(--bone)]/50 transition-colors">
              <div className="w-[200px] shrink-0 sticky left-0 z-10 bg-[var(--surface)] flex items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[var(--ink-muted)]">
                  {isRtl ? "السعر (درهم)" : "Asking Price"}
                </span>
              </div>
              {properties.map((property) => (
                <div key={property.id} className="w-[320px] shrink-0 flex items-center">
                  <span className={`font-mono text-xl font-bold ${property.priceAed === minPrice ? 'text-[var(--sage-dark)]' : 'text-[var(--ink)]'}`}>
                    {formatAed(property.priceAed, locale)}
                  </span>
                  {property.priceAed === minPrice && (
                    <span className="ms-3 text-[10px] uppercase tracking-wider font-bold text-[var(--sage)] bg-[var(--sage-tint)] px-2 py-0.5 border border-[var(--sage)]/30">
                      {isRtl ? "الأفضل سعراً" : "Lowest"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* DLD VERIFICATION */}
            <div className="flex gap-6 border-t border-[var(--line)] py-5 hover:bg-[var(--bone)]/50 transition-colors">
              <div className="w-[200px] shrink-0 sticky left-0 z-10 bg-[var(--surface)] flex items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[var(--ink-muted)]">
                  {isRtl ? "التوثيق الرسمي" : "Official Verification"}
                </span>
              </div>
              {properties.map((property) => (
                <div key={property.id} className="w-[320px] shrink-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="size-4 text-[var(--sage)]" />
                    <span className="text-sm font-semibold text-[var(--ink)]">
                      {property.evidenceCoverage}% {isRtl ? "موثق" : "Verified"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full max-w-[200px] bg-[var(--line)] overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[var(--sage)] to-[var(--sage-dark)]" 
                      style={{ width: `${property.evidenceCoverage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* FIT SCORE */}
            <div className="flex gap-6 border-t border-[var(--line)] py-5 hover:bg-[var(--bone)]/50 transition-colors">
              <div className="w-[200px] shrink-0 sticky left-0 z-10 bg-[var(--surface)] flex items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[var(--ink-muted)]">
                  {isRtl ? "الملاءمة" : "Fit Score"}
                </span>
              </div>
              {properties.map((property) => (
                <div key={property.id} className="w-[320px] shrink-0 flex items-center">
                  <span className={`inline-flex items-center justify-center font-mono text-sm font-bold w-12 h-8 border ${
                    property.fitScore === maxFit 
                      ? 'border-[var(--copper)] bg-[var(--copper-tint)] text-[var(--copper-dark)]' 
                      : 'border-[var(--line-strong)] bg-[var(--canvas)] text-[var(--ink-muted)]'
                  }`}>
                    {property.fitScore}
                  </span>
                  {property.fitScore === maxFit && (
                    <span className="ms-3 text-[10px] uppercase tracking-wider font-bold text-[var(--copper-dark)]">
                      {isRtl ? "أفضل ملاءمة" : "Best Match"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* SPECS */}
            <div className="flex gap-6 border-t border-[var(--line)] py-5 hover:bg-[var(--bone)]/50 transition-colors">
              <div className="w-[200px] shrink-0 sticky left-0 z-10 bg-[var(--surface)] flex items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[var(--ink-muted)]">
                  {isRtl ? "المواصفات" : "Specifications"}
                </span>
              </div>
              {properties.map((property) => (
                <div key={property.id} className="w-[320px] shrink-0 grid grid-cols-2 gap-y-3">
                  <div className="flex items-center gap-2">
                    <BedDouble className="size-4 text-[var(--copper)]" />
                    <span className="font-mono text-sm text-[var(--ink)]">{property.bedrooms ?? "-"} <span className="text-xs font-sans text-[var(--ink-muted)]">{isRtl ? "غرف" : "Beds"}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="size-4 text-[var(--copper)]" />
                    <span className="font-mono text-sm text-[var(--ink)]">{property.bathrooms ?? "-"} <span className="text-xs font-sans text-[var(--ink-muted)]">{isRtl ? "حمامات" : "Baths"}</span></span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Ruler className="size-4 text-[var(--copper)]" />
                    {property.internalAreaSqFt ? (
                      <span className="font-mono text-sm text-[var(--ink)]">{property.internalAreaSqFt.toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-US')} <span className="text-xs font-sans text-[var(--ink-muted)]">sq ft</span></span>
                    ) : (
                      <span className="text-[var(--ink-muted)]">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ACCESSIBILITY */}
            <div className="flex gap-6 border-t border-[var(--line)] py-5 hover:bg-[var(--bone)]/50 transition-colors">
              <div className="w-[200px] shrink-0 sticky left-0 z-10 bg-[var(--surface)] flex items-center">
                <span className="text-xs uppercase tracking-widest font-bold text-[var(--ink-muted)]">
                  {isRtl ? "وصول بدون سلالم" : "Step-Free Access"}
                </span>
              </div>
              {properties.map((property) => (
                <div key={property.id} className="w-[320px] shrink-0 flex items-center">
                  {property.stepFreeAccess === "verified" && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--sage-dark)]">
                      <CheckCircle2 className="size-4" /> {isRtl ? "موثق" : "Verified"}
                    </span>
                  )}
                  {property.stepFreeAccess === "review" && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--caution)]">
                      <Minus className="size-4" /> {isRtl ? "قيد المراجعة" : "Under Review"}
                    </span>
                  )}
                  {property.stepFreeAccess === "unknown" && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--ink-muted)]">
                      <HelpCircle className="size-4" /> {isRtl ? "غير محدد" : "Unknown"}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
          </div>
        </div>
        <ScrollBar orientation="horizontal" className="bg-[var(--line)]" />
      </ScrollArea>
    </div>
  );
}
