"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight, Compass, Calculator, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/container";

interface AppFooterProps {
  locale: Locale;
}

export function AppFooter({ locale }: AppFooterProps) {
  const isAr = locale === "ar";
  const otherLocale = isAr ? "en" : "ar";
  const languageLabel = isAr ? "English" : "العربية";
  const currentYear = 2026;

  const footerLinks = {
    explore: [
      { label: isAr ? "استكشف العقارات" : "Explore Homes", href: `/${locale}/homes` },
      { label: isAr ? "مقارنة العقارات" : "Property Compare", href: `/${locale}/compare` },
      { label: isAr ? "تخطيط الشراء" : "Purchase Plan", href: `/${locale}/plan` },
      { label: isAr ? "غرفة القرار" : "Decision Room", href: `/${locale}/homes` },
    ],
    tools: [
      { label: isAr ? "حاسبة التكاليف" : "Cost Engine", href: `/${locale}/costs` },
      { label: isAr ? "تحليل الجاهزية" : "Readiness Assessment", href: `/${locale}/readiness` },
      { label: isAr ? "مؤشر رسوم الصيانة" : "Service Charge Index", href: `/${locale}/costs` },
      { label: isAr ? "حاسبة الرهن العقاري" : "Mortgage Simulator", href: `/${locale}/costs` },
    ],
    platform: [
      { label: isAr ? "عن راما" : "About RAMA", href: `/${locale}` },
      { label: isAr ? "منهجية التحقق" : "Verification Method", href: `/${locale}` },
      { label: isAr ? "عناية المالك" : "Owner Care", href: `/${locale}/owner-care` },
      { label: isAr ? "بوابة الشركاء" : "Partner Portal", href: `/${locale}/partner/ingestion` },
    ],
    legal: [
      { label: isAr ? "سياسة الخصوصية" : "Privacy Policy", href: `/${locale}/legal/privacy` },
      { label: isAr ? "الشروط والأحكام" : "Terms of Service", href: `/${locale}/legal/terms` },
      { label: isAr ? "إفصاح دائرة الأراضي" : "DLD Disclosure", href: `/${locale}/legal/disclosure` },
      { label: isAr ? "ملفات تعريف الارتباط" : "Cookie Policy", href: `/${locale}/legal/cookies` },
    ],
  };

  return (
    <footer className="bg-[var(--color-surface-dark,#171717)] py-20 lg:py-24 text-[var(--color-text-dark,#B5B0A8)] border-t border-border/20">
      <Container size="wide" className="px-6 lg:px-16">
        
        {/* Top Grid: Brand & Column Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-16 items-start pb-16 border-b border-[#333333]">
          
          {/* Brand Column (Spans 2 on lg) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-none bg-brand text-white font-bold text-sm shadow-inner">
                R
              </span>
              <span className="font-semibold text-white tracking-widest text-lg">RAMA</span>
            </div>
            
            <p className="text-sm max-w-sm leading-relaxed text-[#B5B0A8]">
              {isAr
                ? "منصة القرارات العقارية الموثقة في دبي. نضع بيانات دائرة الأراضي والأملاك وتكاليف الاستحواذ الكاملة بين يديك لقرارات مبنية على يقين."
                : "Verified Dubai real-estate decision platform. We pair official Dubai Land Department data and complete upfront cost mapping for decisions built on certainty."}
            </p>

            {/* DLD Telemetry Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-positive/30 bg-positive-soft/10 px-3.5 py-1.5 text-xs font-medium text-positive">
              <ShieldCheck className="size-4 shrink-0 text-positive" />
              <span>{isAr ? "سجلات دائرة الأراضي والأملاك موثقة 100%" : "100% DLD Cross-Checked Records"}</span>
            </div>
          </div>

          {/* Navigation Columns */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
              {isAr ? "استكشف" : "Explore"}
            </h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href as any} className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
              {isAr ? "الأدوات والحاسبات" : "Calculators & Data"}
            </h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.tools.map((link) => (
                <li key={link.label}>
                  <Link href={link.href as any} className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
              {isAr ? "المنصة" : "Platform"}
            </h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href as any} className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-4">
              {isAr ? "قانوني" : "Legal"}
            </h4>
            <ul className="space-y-3 text-sm">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href as any} className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Telemetry & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#B5B0A8]">
          <div className="flex items-center gap-3">
            <span className="size-2 rounded-full bg-positive animate-pulse" />
            <p>© {currentYear} RAMA Real-Estate. {isAr ? "جميع الحقوق محفوظة. بيانات دبي العقارية الموثقة." : "All rights reserved. Verified property data for Dubai."}</p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href={`/${otherLocale}/homes` as any}
              lang={otherLocale}
              className="text-xs font-semibold text-white hover:text-brand transition-colors"
            >
              {languageLabel}
            </Link>
            <span className="text-[#444444]">•</span>
            <span className="font-mono text-[11px] text-muted">DLD TELEMETRY 2026</span>
          </div>
        </div>

      </Container>
    </footer>
  );
}
