import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { isLocale, type Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Buying Readiness & Plan — RAMA Dubai",
  description: "Track your home buying readiness, requirements, and next steps with complete control.",
};

export default async function PlanPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value as Locale;
  const isAr = locale === "ar";

  const steps = [
    {
      title: isAr ? "الموافقة المبدئية للتمويل" : "Mortgage pre-approval",
      description: isAr ? "تأكيد ميزانية الشراء مع المصرف قبل اختيار العقار" : "Confirm purchase budget limits with a bank pre-approval.",
      completed: true,
    },
    {
      title: isAr ? "تأكيد الهوية والمستندات" : "Identity verification",
      description: isAr ? "رفع الهوية الإماراتية وجواز السفر لمراجعة متطلبات دائرة الأراضي" : "Upload Emirates ID and passport for land department compliance.",
      completed: true,
    },
    {
      title: isAr ? "تحديد متطلبات الأسرة" : "Household requirements",
      description: isAr ? "تفضيلات الموقع ووقت التنقل والمساحة — اختيارية ويمكن تعديلها لاحقاً." : "Optional preferences for commute times, spatial fit, and amenities.",
      completed: false,
    },
    {
      title: isAr ? "حجز الوحدة وتوقيع العقد" : "Unit reservation & agreement",
      description: isAr ? "توقيع اتفاقية الحجز ودفع عربون الشراء الموثق" : "Sign reservation contract and execute secure transaction deposit.",
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--limestone)] text-[var(--ink)]" dir={isAr ? "rtl" : "ltr"}>
      <AppHeader locale={locale} />

      <main>
        <Container size="medium" className="py-14 lg:py-24">
          {/* Header */}
          <div className="space-y-4 pb-12 relative text-center max-w-2xl mx-auto">
            <div className="luxury-divider mx-auto w-20" style={{ marginBlock: '0 32px' }} />
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--copper-dark)]">
              {isAr ? "دليل الشراء" : "BUYING READINESS"}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-ink reveal-up">
              <BlurFade delay={0.1} inView>
                {isAr ? "خطوات الاستعداد لشراء عقارك" : "Buying readiness & checklist"}
              </BlurFade>
            </h1>
            <p className="text-[15px] leading-relaxed text-text mt-4 mx-auto max-w-[560px] reveal-up delay-100">
              {isAr
                ? "خطوات واضحة وغير إلزامية. يمكنك العودة أو التخطي في أي وقت دون حظر تصفح العقارات."
                : "Optional progress steps. You can browse, save, and skip steps anytime."}
            </p>
          </div>

          {/* Steps — Premium glassmorphism approach */}
          <MagicCard className="mt-8 reveal-up delay-200 divide-y divide-[var(--line)] p-2" gradientColor="var(--copper-tint)">
            {steps.map((step, index) => {
              const num = (index + 1).toString().padStart(2, '0');
              return (
                <div
                  key={index}
                  className={`flex flex-col sm:flex-row items-start justify-between gap-6 sm:gap-8 p-6 lg:p-8 transition-colors duration-300 hover:bg-white/40 ${step.completed ? 'opacity-80' : ''}`}
                >
                  <div className="flex gap-6 items-start flex-1">
                    <span className={`font-serif text-2xl lg:text-3xl font-light mt-1 ${step.completed ? 'text-[var(--sage)]' : 'text-[var(--copper-dark)]'}`}>
                      {num}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-medium text-ink mb-2 leading-snug">
                        {step.title}
                      </p>
                      <p className="text-sm text-text leading-relaxed max-w-[480px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {step.completed && (
                    <div className="trust-badge mt-2 sm:mt-0 shadow-sm shrink-0">
                      <span className="size-1.5 rounded-full bg-[var(--sage)]"></span>
                      <span>{isAr ? "مكتمل" : "Completed"}</span>
                    </div>
                  )}
                  {!step.completed && (
                    <div className="mt-2 sm:mt-0 shrink-0">
                      <button className="text-[11px] font-bold uppercase tracking-wider text-[var(--copper-dark)] border border-[var(--copper)]/30 hover:bg-[var(--copper-tint)] px-4 py-2 transition-colors">
                        {isAr ? "تحديث" : "Update"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </MagicCard>

          {/* Footer links */}
          <div className="pt-16 pb-8 flex flex-col sm:flex-row justify-between items-center gap-6 reveal-up delay-300">
            <Link href={`/${locale}/homes`} className="group w-full sm:w-auto h-12 flex items-center justify-center gap-2 bg-[var(--ink)] text-white hover:bg-[var(--copper-dark)] px-8 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer">
              {isAr ? "تصفح العقارات المتاحة" : "Browse available homes"}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link href={`/${locale}/costs`} className="gold-accent flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--copper-dark)] hover:text-[var(--ink)] py-2 transition-colors">
              {isAr ? "احسب التكاليف الكاملة" : "Calculate complete costs"}
              <ArrowRight className="size-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </Container>
      </main>
    </div>
  );
}
