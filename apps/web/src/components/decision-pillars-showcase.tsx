"use client";

import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ShieldCheck, Calculator, Compass, CheckCircle2, Clock, MapPin, Building2, Car, Navigation } from "lucide-react";
import { Container } from "@/components/ui/container";
import { StackingCardsParallax, type ParallaxCardData } from "./pixel-perfect/stacking-cards-parallax";

interface DecisionPillarsShowcaseProps {
  locale: string;
}

export function DecisionPillarsShowcase({ locale }: DecisionPillarsShowcaseProps) {
  const isAr = locale === "ar";

  const cards: ParallaxCardData[] = [
    {
      id: "verified-facts",
      title: isAr ? "حقائق موثقة" : "Verified Facts",
      description: isAr
        ? "ملخصات دقيقة بأسلوب واضح: 18 من 22 تفصيل موثق من المصادر الرسمية ودائرة الأراضي والأملاك."
        : "Clear plain-language summaries with 18 of 22 facts confirmed from official Dubai Land Department records.",
      color: "var(--surface)", // elegant light neutral
      content: (
        <div className="p-6 lg:p-8 space-y-6 w-full h-full flex flex-col justify-center">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-7 items-center justify-center bg-ink text-white text-xs font-bold">DLD</span>
              <div>
                <h4 className="text-sm font-semibold text-ink">
                  {isAr ? "سجل التحقق الرسمي" : "Official Verification Ledger"}
                </h4>
                <p className="text-[11px] text-muted">
                  {isAr ? "دائرة الأراضي والأملاك بدبي · سجل #784-2025" : "Dubai Land Dept · Record #784-2025"}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-ink bg-black/5 px-2.5 py-1 border border-border">
              {isAr ? "18 من 22 تفصيل موثق" : "18 of 22 Facts Verified"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start justify-between p-3 bg-white/50 border border-border/40">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">{isAr ? "سند الملكية وملكية الأرض" : "Title Deed & Plot Ownership"}</p>
                  <p className="text-[11px] text-muted">{isAr ? "مطابق 100% مع سجل دائرة الأراضي" : "100% match with DLD central registry"}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono text-emerald-700 font-medium">{isAr ? "مؤكد" : "PASSED"}</span>
            </div>

            <div className="flex items-start justify-between p-3 bg-white/50 border border-border/40">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">{isAr ? "حساب الضمان ورسوم الصيانة" : "Escrow Account & Service Charges"}</p>
                  <p className="text-[11px] text-muted">{isAr ? "تم التحقق من RERA: 18.5 درهم/قدم مربع" : "RERA verified: AED 18.5/sqft"}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono text-emerald-700 font-medium">{isAr ? "مؤكد" : "PASSED"}</span>
            </div>

            <div className="flex items-start justify-between p-3 bg-white/50 border border-border/40">
              <div className="flex items-start gap-2.5">
                <Clock className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">{isAr ? "معاينة جودة التسليم الفعلي" : "Physical Snagging & Clearances"}</p>
                  <p className="text-[11px] text-muted">{isAr ? "قيد المعاينة الميدانية بواسطة الخبراء" : "Scheduled for expert field inspection"}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-mono text-amber-700 font-medium">{isAr ? "قيد التوثيق" : "PENDING"}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "true-costs",
      title: isAr ? "تكاليف حقيقية" : "True Costs",
      description: isAr
        ? "توزيع مرحلي شفاف: عند الحجز، عند نقل الملكية (DLD 4%)، وأثناء الملكية دون أي مفاجآت."
        : "Staged breakdown: at reservation, at DLD transfer, and during ongoing ownership with zero hidden fees.",
      color: "var(--bone)", // warm neutral
      content: (
        <div className="p-6 lg:p-8 space-y-6 w-full h-full flex flex-col justify-center">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div>
              <h4 className="text-sm font-semibold text-ink">
                {isAr ? "توزيع تكلفة الاستحواذ المباشرة" : "Upfront Acquisition Fee Mapping"}
              </h4>
              <p className="text-[11px] text-muted">
                {isAr ? "شقة 2 غ نوم · مارينا دبي · AED 2,500,000" : "Dubai Marina 2BR · AED 2,500,000"}
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-ink bg-white/50 px-3 py-1 border border-border/40">
              AED 2,662,740
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted">{isAr ? "دفعة حجز الملكية (10%)" : "Initial Reservation (10%)"}</span>
              <span className="font-medium text-ink">AED 250,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted">{isAr ? "رسوم نقل الملكية (DLD 4%)" : "DLD Transfer Fee (4%)"}</span>
              <span className="font-medium text-ink">AED 100,000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted">{isAr ? "عمولة الوساطة (2% + VAT)" : "Agency Fee (2% + VAT)"}</span>
              <span className="font-medium text-ink">AED 52,500</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/30">
              <span className="text-muted">{isAr ? "رسوم أمين التسجيل والرهن" : "Trustee & Mortgage Reg"}</span>
              <span className="font-medium text-ink">AED 10,240</span>
            </div>
          </div>

          <div className="p-3 bg-white/40 border border-border/40 flex items-center justify-between text-xs font-sans">
            <span className="font-medium text-ink">{isAr ? "التكلفة الإضافية فوق السعر المعلن:" : "Acquisition Premium:"}</span>
            <span className="font-semibold text-ink font-mono">+6.51% (AED 162,740)</span>
          </div>
        </div>
      )
    },
    {
      id: "location-fit",
      title: isAr ? "ملاءمة الموقع" : "Location Fit",
      description: isAr
        ? "تقييم دقيق لأوقات التنقل في ذروة الازدحام، المدارس المجاورة، وتخطيط المساحة السكنية."
        : "Precise evaluation of peak commute times, nearby schools, and spatial layout match.",
      color: "var(--sage-tint)", // muted green tint
      content: (
        <div className="p-6 lg:p-8 space-y-6 w-full h-full flex flex-col justify-center">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <h4 className="text-sm font-semibold text-ink">
                {isAr ? "مصفوفة التنقل والملاءمة اليومية" : "Everyday Commute & Location Fit"}
              </h4>
              <p className="text-[11px] text-muted">
                {isAr ? "حساب أوقات ذروة الازدحام والمرور" : "Evaluated during peak morning & evening hours"}
              </p>
            </div>
            <span className="text-xs font-semibold text-ink bg-white/40 px-2.5 py-1 border border-border/30">
              9.4 / 10 Fit Score
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white/40 border border-border/30 space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Building2 className="size-3.5 text-ink/60" />
                <span className="text-[11px] font-medium">{isAr ? "مركز دبي المالي (DIFC)" : "DIFC Financial"}</span>
              </div>
              <p className="font-semibold text-ink text-sm">12 mins <span className="text-[10px] text-muted font-normal">Drive</span></p>
            </div>

            <div className="p-3 bg-white/40 border border-border/30 space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Navigation className="size-3.5 text-ink/60" />
                <span className="text-[11px] font-medium">{isAr ? "مطار دبي الدولي (DXB)" : "Dubai Airport"}</span>
              </div>
              <p className="font-semibold text-ink text-sm">18 mins <span className="text-[10px] text-muted font-normal">Drive</span></p>
            </div>

            <div className="p-3 bg-white/40 border border-border/30 space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <MapPin className="size-3.5 text-ink/60" />
                <span className="text-[11px] font-medium">{isAr ? "مدرسة جيمس الدولية" : "GEMS School"}</span>
              </div>
              <p className="font-semibold text-ink text-sm">6 mins <span className="text-[10px] text-muted font-normal">Walk</span></p>
            </div>

            <div className="p-3 bg-white/40 border border-border/30 space-y-1">
              <div className="flex items-center gap-1.5 text-muted">
                <Car className="size-3.5 text-ink/60" />
                <span className="text-[11px] font-medium">{isAr ? "محطة مترو دبي" : "Dubai Metro Station"}</span>
              </div>
              <p className="font-semibold text-ink text-sm">4 mins <span className="text-[10px] text-muted font-normal">Walk</span></p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-canvas border-b border-border">
      <Container size="wide" className="px-6 lg:px-16">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <p className="section-overline">
            {isAr ? "كيف نساعدك على الاختيار" : "How we help you choose"}
          </p>
          <h2 className="text-heading">
            {isAr ? "ثلاثة أمور تهمك" : "Three things that matter"}
          </h2>
          <p className="text-sm text-text font-light leading-relaxed">
            {isAr 
              ? "نتحقق من الحقائق، ونحدد كل تكلفة، ونتأكد من الملاءمة — حتى لا تضطر إلى التخمين أبدًا."
              : "We verify the facts, map every cost, and check the fit — so you never have to guess."}
          </p>
        </div>
      </Container>
      
      {/* Scroll-driven Stacking Cards Parallax */}
      <StackingCardsParallax cards={cards} />
    </section>
  );
}
