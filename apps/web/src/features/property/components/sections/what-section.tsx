import dynamic from "next/dynamic";
import { localize, type Locale } from "@/lib/i18n";
import type { PropertyDecisionRoom } from "@rama/contracts";
import TextReveal from "@/components/pixel-perfect/text-reveal";
import Border1 from "@/components/pixel-perfect/border1";

const GuidedLiveTour = dynamic(
  () => import("../guided-live-tour").then((mod) => mod.GuidedLiveTour),
  { loading: () => <div className="h-64 rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Live Tour...</div> }
);

const TourExperience = dynamic(
  () => import("../tour-experience").then((mod) => mod.TourExperience),
  { loading: () => <div className="h-96 rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Tour Experience...</div> }
);

const basisLabels = {
  en: { measured: "Measured", source_provided: "Source-provided", modelled: "Modelled", unknown: "Unknown" },
  ar: { measured: "مقاس", source_provided: "من المصدر", modelled: "محسوب", unknown: "غير معروف" },
} as const;

export function WhatSection({
  locale,
  property,
  sectionTitle,
}: {
  locale: Locale;
  property: PropertyDecisionRoom;
  sectionTitle: string;
}) {
  const isAr = locale === "ar";
  
  return (
    <section id="what" aria-labelledby="what-heading">
      <div className="space-y-3 mb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-brand">RAMA / 01</p>
        <h2 id="what-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-light">
          <TextReveal>{sectionTitle}</TextReveal>
        </h2>
        <p className="text-sm text-text leading-relaxed max-w-xl">
          {isAr ? "كل حقيقة توضّح أساسها؛ المقاس يختلف عن المعلومة المقدمة من المصدر." : "Every fact shows its basis; measured is different from source-provided."}
        </p>
      </div>

      {/* Facts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {property.facts.map((fact) => (
          <div key={fact.label.en} className="relative border border-border bg-surface p-4 space-y-1.5 group hover:border-brand/40 transition-colors">
            <Border1 />
            <dt className="text-xs text-text font-medium">{localize(fact.label, locale)}</dt>
            <dd className="text-lg font-mono font-bold text-ink">{localize(fact.value, locale)}</dd>
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-brand bg-brand/10 px-1.5 py-0.5 border border-brand/20">
              {basisLabels[locale][fact.basis]}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <GuidedLiveTour locale={locale} />
      </div>
      <TourExperience locale={locale} tour={property.tour} />
    </section>
  );
}
// cache bust
