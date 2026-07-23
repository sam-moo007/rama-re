import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getCompareData, getDiscoveryData } from "@/lib/catalogue-data";
import { CompareTable } from "@/features/compare/compare-table";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/app-header";
import { Container } from "@/components/ui/container";
import Link from "next/link";
import { BlurFade } from "@/components/ui/blur-fade";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare Properties — RAMA Dubai" };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slugs?: string }>;
};

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();

  const isRtl = value === "ar";
  const search = await searchParams;
  let targetSlugs: string[] = [];

  if (search.slugs) {
    targetSlugs = search.slugs.split(",").map(s => s.trim()).filter(Boolean);
  } else {
    // If no slugs in URL, fetch the user's shortlist
    try {
      const { shortlist } = await getDiscoveryData({});
      if (shortlist.shortlist && shortlist.shortlist.propertySlugs.length > 0) {
        targetSlugs = shortlist.shortlist.propertySlugs;
      }
    } catch (e) {
      console.error("Failed to fetch shortlist for comparison", e);
    }
  }

  // Max 3 properties for comparison
  targetSlugs = targetSlugs.slice(0, 3);

  return (
    <div lang={value} dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-canvas text-ink">
      <AppHeader locale={value as any} />

      <main>
        <Container size="full" className="py-8">
        {targetSlugs.length < 2 ? (
          <BlurFade delay={0.1} inView className="py-24 text-center reveal-up">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[var(--ink)] mb-4">
              {isRtl ? "لم يتم تحديد عقارات للمقارنة" : "Select properties to compare"}
            </h1>
            <p className="text-body mx-auto max-w-md mb-8 text-[var(--ink-muted)]">
              {isRtl 
                ? "اختر من 2 إلى 3 عقارات لمقارنة التفاصيل والتكاليف والملاءمة بدقة." 
                : "Choose 2 to 3 homes to compare details, costs, and fit with absolute clarity."}
            </p>
            <div className="flex justify-center">
              <Link href={`/${value}/homes`} className="group w-full sm:w-auto h-12 flex items-center justify-center gap-2 bg-[var(--ink)] text-white hover:bg-[var(--copper-dark)] px-8 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg cursor-pointer">
                {isRtl ? "تصفح العقارات المتاحة" : "Browse available homes"}
              </Link>
            </div>
          </BlurFade>
        ) : (
          (() => {
            try {
              // We render compare table
              return (
                <div className="space-y-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-[var(--copper)] pb-6 mb-2">
                    <div className="reveal-up">
                      <p className="section-overline mb-2">
                        {isRtl ? 'أداة التحليل' : 'ANALYTICS TOOL'}
                      </p>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light tracking-tight text-[var(--ink)]">
                        {isRtl ? "مقارنة العقارات" : "Property comparison"}
                      </h1>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-muted)] bg-[var(--surface-dark)]/5 px-4 py-2 mt-4 sm:mt-0 reveal-up delay-100">
                      {isRtl ? `مقارنة ${targetSlugs.length} عقارات` : `Comparing ${targetSlugs.length} properties (Max 3)`}
                    </span>
                  </div>

                  <CompareTableWrapper targetSlugs={targetSlugs} locale={value as any} />
                </div>
              );
            } catch (error) {
              return (
                <div className="p-4 bg-destructive/10 text-destructive rounded-none border border-destructive/30 text-sm">
                  {error instanceof Error ? error.message : "Failed to load comparison."}
                </div>
              );
            }
          })()
        )}
        </Container>
      </main>
    </div>
  );
}

async function CompareTableWrapper({ targetSlugs, locale }: { targetSlugs: string[]; locale: any }) {
  const { compare } = await getCompareData(targetSlugs);
  return <CompareTable properties={compare.items} locale={locale} />;
}
