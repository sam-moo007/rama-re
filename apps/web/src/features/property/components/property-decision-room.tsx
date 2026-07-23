import type { PropertyDecisionRoom } from "@rama/contracts";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { AppHeader } from "@/components/app-header";
import { copy, localize, type Locale } from "@/lib/i18n";

import { PropertyHero } from "./property-hero";

// Import the new modular sections
import { WhatSection } from "./sections/what-section";
import { CostSection } from "./sections/cost-section";
import { WhereSection } from "./sections/where-section";
import { TrustSection } from "./sections/trust-section";
import { FitSection } from "./sections/fit-section";
import { NextSection } from "./sections/next-section";

type PropertyDecisionRoomProps = {
  locale: Locale;
  property: PropertyDecisionRoom;
};

export function PropertyDecisionRoomView({ locale, property }: PropertyDecisionRoomProps) {
  const text = copy[locale];
  const isAr = locale === "ar";

  return (
    <div className="min-h-screen bg-canvas" dir={isAr ? "rtl" : "ltr"} lang={locale}>
      <a className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-brand focus:text-white focus:px-4 focus:py-2" href="#main-content">
        {isAr ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>

      {/* Unified AppHeader */}
      <AppHeader
        locale={locale}
        badge={isAr ? "عقار موثق" : "Verified Property"}
        title={localize(property.name, locale)}
      />

      <main id="main-content">
        <Container size="wide" className="px-6 lg:px-16">
          {/* Breadcrumbs */}
          <nav className="py-4 flex items-center gap-2 text-xs text-text" aria-label={isAr ? "مسار الصفحة" : "Breadcrumb"}>
            <Link href={`/${locale}/homes` as any} className="hover:text-brand transition-colors">
              {isAr ? "العقارات" : "Homes"}
            </Link>
            <span className="text-border">/</span>
            <span className="text-text font-medium">{localize(property.community, locale)}</span>
            <span className="text-border">/</span>
            <span className="text-ink font-semibold" aria-current="page">{localize(property.name, locale)}</span>
          </nav>

          {/* Property Hero */}
          <PropertyHero locale={locale} property={property} />

          {/* Decision Layout: Rail + Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 py-16 lg:py-20">

            {/* Sticky Section Rail */}
            <aside className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start space-y-6">
              <p className="text-xs uppercase tracking-widest font-semibold text-brand">
                {isAr ? "سجل القرار" : "Decision record"}
              </p>
              <nav className="space-y-1" aria-label={isAr ? "أقسام العقار" : "Property sections"}>
                {text.sections.map(([id, label], index) => (
                  <a
                    href={`#${id}`}
                    key={id}
                    className="flex items-center gap-3 py-2.5 ps-3 border-s-2 border-transparent text-text text-sm hover:border-brand hover:text-ink transition-all"
                  >
                    <span className="text-[10px] font-mono font-bold text-muted w-5">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium">{label}</span>
                  </a>
                ))}
              </nav>
              <div className="border-t border-border pt-4 flex items-center gap-2 text-xs text-text">
                <ShieldCheck aria-hidden="true" className="size-4 text-emerald-600 shrink-0" />
                <span>
                  <strong className="text-ink">
                    {isAr
                      ? `${property.claims.filter((c) => c.status === "verified").length} من ${property.claims.length} `
                      : `${property.claims.filter((c) => c.status === "verified").length} of ${property.claims.length} `}
                  </strong>
                  {isAr ? "حقائق رئيسية موثقة" : "key facts verified"}
                </span>
              </div>
            </aside>

            {/* Main Content Sections */}
            <div className="lg:col-span-9 space-y-20 lg:space-y-24">
              <WhatSection locale={locale} property={property} sectionTitle={text.sections[0][1]} />
              <CostSection locale={locale} property={property} sectionTitle={text.sections[1][1]} costTitle={text.costTitle} costIntro={text.costIntro} />
              <WhereSection locale={locale} property={property} sectionTitle={text.sections[2][1]} />
              <TrustSection locale={locale} property={property} sectionTitle={text.sections[3][1]} />
              <FitSection locale={locale} property={property} sectionTitle={text.sections[4][1]} />
              <NextSection locale={locale} property={property} sectionTitle={text.sections[5][1]} />
            </div>
          </div>
        </Container>
      </main>

      {/* Unified Footer */}
      <footer className="bg-[#171717] py-20 lg:py-24 text-[#B5B0A8]">
        <Container size="wide" className="px-6 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 items-start">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-none bg-white text-ink font-bold text-sm">R</span>
                <span className="font-semibold text-white tracking-widest">RAMA</span>
              </div>
              <p className="text-sm max-w-sm leading-relaxed text-[#B5B0A8]">
                {isAr
                  ? "الأدلة والملاءمة والمفاضلات في مكان واحد."
                  : "The evidence, fit and trade-off in one place."}
              </p>
              <p className="text-xs text-[#777]">
                {isAr
                  ? "لا يحل تحقق راما محل دائرة الأراضي والأملاك أو المشورة القانونية أو التقييم أو المعاينة الفعلية."
                  : "RAMA verification does not replace DLD, legal review, valuation or physical inspection."}
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-medium text-sm">{isAr ? "الشركة" : "Company"}</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href={`/${locale}/homes` as any} className="text-[#EAE6E1] hover:text-brand transition-colors">{isAr ? "العقارات" : "Homes"}</Link></li>
                <li><Link href={`/${locale}/costs` as any} className="text-[#EAE6E1] hover:text-brand transition-colors">{isAr ? "التكاليف" : "Costs"}</Link></li>
                <li><Link href={`/${locale}/compare` as any} className="text-[#EAE6E1] hover:text-brand transition-colors">{isAr ? "مقارنة" : "Compare"}</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-medium text-sm">{isAr ? "قانوني" : "Legal"}</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="text-[#EAE6E1] hover:text-brand transition-colors">{isAr ? "الخصوصية" : "Privacy"}</Link></li>
                <li><Link href="#" className="text-[#EAE6E1] hover:text-brand transition-colors">{isAr ? "الشروط" : "Terms"}</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-[#333333] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#B5B0A8]">
            <p>© {new Date().getFullYear()} RAMA. {isAr ? "بيانات عقارية موثقة لدبي." : "Verified property data for Dubai."}</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
