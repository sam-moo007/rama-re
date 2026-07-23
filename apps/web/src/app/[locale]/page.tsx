import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isLocale } from "@/lib/i18n";
import { catalogueFixtures } from "@rama/contracts";
import { ShieldCheck, Calculator, Compass, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { DecisionPillarsShowcase } from "@/components/decision-pillars-showcase";
import { Announcement, AnnouncementTag, AnnouncementTitle } from "@/components/kibo-ui/announcement";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TextFade } from "@/components/pixel-perfect/text-fade";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ProgressiveBlur from "@/components/pixel-perfect/progressive-blur";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RAMA — Verified Dubai Real Estate",
  description:
    "Find a Dubai home with verified facts, complete buying costs, and everyday location fit in one calm experience.",
};

const PROPERTY_IMAGES: Record<string, string> = {
  "residence-1204": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=100&w=2000&auto=format&fit=crop",
  "marina-penthouse-5401": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=100&w=2000&auto=format&fit=crop",
  "downtown-penthouse-ph03": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=100&w=2000&auto=format&fit=crop",
  "garden-court-805-demo": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=100&w=2000&auto=format&fit=crop",
  "marina-home-demo": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=100&w=2000&auto=format&fit=crop",
  "canal-loft-demo": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=100&w=2000&auto=format&fit=crop",
  "palm-villa-b7": "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=100&w=2000&auto=format&fit=crop",
};

function formatAedShort(price: number, isAr: boolean): string {
  if (price >= 1_000_000) {
    const m = (price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1);
    return isAr ? `${m} مليون د.إ.` : `AED ${m}M`;
  }
  return isAr
    ? `${(price / 1000).toFixed(0)} ألف د.إ.`
    : `AED ${(price / 1000).toFixed(0)}K`;
}

type Props = { params: Promise<{ locale: string }> };

export default async function HomeLocalePage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();

  const isAr = value === "ar";
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.has("__Host-rama-customer-token");
  const dir = isAr ? "rtl" : "ltr";

  // Featured listings — top 3 curated properties
  const featured = catalogueFixtures
    .filter((p) => p.recordKind === "curated" && p.decisionRoomAvailable)
    .slice(0, 3);

  return (
    <div lang={value} dir={dir} className="min-h-screen text-ink relative w-full">
      
      {/* ── Main Content Wrapper (covers the sticky footer) ──────────────── */}
      <div className="relative z-10 bg-canvas shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex flex-col">
        
        {/* Navigation — sits above video hero */}
        <AppHeader locale={value as any} variant="landing" isAuthenticated={isAuthenticated} />

        {/* ── Hero: Full-viewport video background ───────────────────────── */}
        <section className="relative overflow-hidden bg-black h-[90vh] max-h-[720px] min-h-[500px] flex items-center border-b border-border">
        {/* Video background — absolutely positioned, no overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-80"
        >
          <source src="/video/hero-background.mp4" type="video/mp4" />
        </video>

        <Container size="wide" className="relative z-10 w-full px-6 lg:px-16 mt-16">
          <div className="max-w-2xl space-y-8">
            
            <div className="reveal-up">
              <Announcement>
                <AnnouncementTag variant="positive">
                  {isAr ? "موثق DLD" : "DLD Verified"}
                </AnnouncementTag>
                <AnnouncementTitle>
                  <span>{isAr ? "بيانات دبي العقارية المحدثة 2026" : "Dubai Real Estate Telemetry 2026"}</span>
                  <ArrowRight className="size-3.5 text-brand shrink-0 rtl:rotate-180" />
                </AnnouncementTitle>
              </Announcement>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-white tracking-tight font-serif font-light leading-[1.05] text-balance drop-shadow-md">
              <BlurFade delay={0.1} inView>
                {isAr ? (
                  <>منزل في دبي،<br /><span className="text-[var(--copper)] italic font-normal">مفهوم بالكامل.</span></>
                ) : (
                  <>A Dubai home,<br /><span className="text-[var(--copper)] italic font-normal">fully understood.</span></>
                )}
              </BlurFade>
            </h1>

            <div className="reveal-up delay-200 space-y-2 max-w-md drop-shadow-sm">
              <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed">
                {isAr
                  ? "تفاصيل موثقة. تكاليف كاملة. ملاءمة مثالية."
                  : "Verified details. Complete costs. Perfect fit."}
              </p>
              <p className="text-xs italic text-white/70 font-medium tracking-wide">
                {isAr 
                  ? "كل تفصيل تم التحقق منه ومقاطعته مع دائرة الأراضي والأملاك في دبي."
                  : "Every detail cross-checked with Dubai Land Department."}
              </p>
            </div>

            {/* Compact Search Bar */}
            <form action={`/${value}/homes`} className="reveal-up delay-300 h-12 flex items-center bg-canvas/95 backdrop-blur-sm shadow-xl rounded-md border border-border/60 max-w-[450px] overflow-hidden group/search hover:border-brand/40 transition-colors">
              <div className="flex-1 flex items-center px-4 h-full">
                <svg className="size-4 text-muted shrink-0 group-hover/search:text-brand transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  type="text"
                  name="q"
                  placeholder={isAr ? "أين ترغب بالعيش؟" : "Where would you like to live?"}
                  className="w-full bg-transparent px-3 text-sm font-medium placeholder:text-muted focus:outline-none h-full text-ink"
                />
              </div>
              <button
                type="submit"
                className="h-full flex items-center justify-center bg-surface-subtle hover:bg-surface text-ink shrink-0 px-5 border-s border-border/50 transition-colors cursor-pointer"
              >
                <span className="font-medium text-xs hidden sm:block me-2">{isAr ? "بحث" : "Search"}</span>
                <ArrowRight className="size-4 shrink-0 rtl:rotate-180" />
              </button>
            </form>

            {/* Tool Links */}
            <div className="reveal-up delay-400 flex flex-wrap items-center gap-4 pt-2">
              <Link href={`/${value}/costs`} className="inline-flex items-center text-xs font-medium text-white/90 hover:text-white transition-colors">
                <Calculator className="size-3.5 me-2 text-[var(--copper)]" />
                <span className="underline underline-offset-4 decoration-white/30 hover:decoration-white/80 transition-colors">{isAr ? "حاسبة التكاليف" : "Calculate costs"}</span>
              </Link>
              <Link href={`/${value}/compare`} className="inline-flex items-center text-xs font-medium text-white/90 hover:text-white transition-colors">
                <Compass className="size-3.5 me-2 text-[var(--copper)]" />
                <span className="underline underline-offset-4 decoration-white/30 hover:decoration-white/80 transition-colors">{isAr ? "مقارنة العقارات" : "Compare homes"}</span>
              </Link>
            </div>

          </div>
        </Container>
      </section>
      {/* Infinite Trust Ticker Section */}
      <section className="bg-surface-subtle border-b border-border py-5 overflow-hidden relative">
        <Container size="wide">
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-muted">
            <div className="md:w-60 shrink-0 md:border-e md:border-border md:pe-6 flex items-center gap-3">
              <ShieldCheck className="size-5 text-brand shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-ink leading-tight">
                {isAr ? "قرارات عقارية مبنية على يقين" : "Powering decisions with verified data"}
              </p>
            </div>
            
            <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-1">
              <Marquee pauseOnHover className="[--duration:20s]">
                {(isAr ? [
                  "دائرة الأراضي والأملاك في دبي (DLD)",
                  "تأكيد الرسوم والتكاليف الحكومية",
                  "تطوير إعمار وصوبا ومراس",
                  "تحليل مسافات التنقل اليومية",
                  "سجلات الملكية الموثوقة 100%",
                ] : [
                  "Dubai Land Dept Official Records (DLD)",
                  "Complete Upfront Acquisition Fee Mapping",
                  "Curated Emaar, Sobha & Meraas Communities",
                  "Peak Commute & Everyday Location Fit",
                  "100% Fact-Checked Title Deed Verification",
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 shrink-0 mx-4">
                    <span className="size-1.5 rounded-full bg-brand/60" />
                    <span className="text-xs sm:text-sm font-medium text-text whitespace-nowrap">{item}</span>
                  </div>
                ))}
              </Marquee>
              {/* Edge Gradient Blurs (using Magic UI defaults or custom) */}
              <div className="pointer-events-none absolute inset-y-0 start-0 w-1/4 bg-gradient-to-r from-surface-subtle to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 end-0 w-1/4 bg-gradient-to-l from-surface-subtle to-transparent z-10" />
            </div>
          </div>
        </Container>
      </section>

      {/* 2. Featured Verified Properties */}
      <section className="py-24 lg:py-32">
        <Container size="wide">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-4">
            <div className="space-y-3">
              <p className="section-overline">
                {isAr ? "عقارات مختارة" : "Curated homes"}
              </p>
              <h2 className="text-heading">
                {isAr ? "منازل تم اختيارها بعناية" : "Homes chosen with care"}
              </h2>
            </div>
            <Link href={`/${value}/homes`} className="text-sm font-medium text-[var(--copper-dark)] hover:text-ink flex items-center group">
              {isAr ? "استكشف جميع العقارات" : "Explore all homes"} 
              <span className="ms-1 inline-block transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((property, idx) => {
              const name = isAr ? property.name.ar : property.name.en;
              const community = isAr ? property.community.ar : property.community.en;
              const image = PROPERTY_IMAGES[property.slug] ?? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=100&w=2000&auto=format&fit=crop";
              const price = formatAedShort(property.priceAed, isAr);

              return (
                <Link
                  key={property.id}
                  href={`/${value}/homes/${property.slug}`}
                  className={`luxury-card group block bg-surface overflow-hidden border border-border shadow-sm reveal-up delay-${(idx + 1) * 100}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={image}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="luxury-card-image object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    <div className="absolute top-4 start-4 z-10">
                      <span className="trust-badge shadow-sm">
                        <span className={`size-1.5 rounded-full ${property.tenure === 'off_plan' ? 'bg-[var(--ochre)]' : 'bg-[var(--sage)]'}`}></span>
                        {property.tenure === "off_plan" ? (isAr ? "قيد الإنشاء" : "Off-plan") : (isAr ? "جاهز" : "Ready")}
                      </span>
                    </div>
                    {/* Price overlay on image */}
                    <div className="absolute bottom-4 end-4 z-10">
                      <span className="bg-[var(--ink)]/85 backdrop-blur-sm text-white font-mono font-bold text-sm px-3 py-1.5 border border-white/10">
                        {price}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest text-[var(--copper-dark)] font-semibold mb-1">
                        {community}
                      </p>
                      <h3 className="text-lg font-serif font-medium text-ink group-hover:text-[var(--copper-dark)] transition-colors duration-300">
                        {name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-4 border-t border-border">
                      <span className="text-muted font-medium">{property.bedrooms ?? "—"} {isAr ? "غرف" : "beds"} &middot; {property.internalAreaSqFt ? property.internalAreaSqFt.toLocaleString() : "—"} sq ft</span>
                      <span className="inline-flex items-center gap-1.5 text-[var(--sage)] font-bold text-[11px] uppercase tracking-wider">
                        <CheckCircle2 className="size-3.5" />
                        {isAr ? "موثق" : "Verified"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. Three Decision Pillars (Interactive Showcase) */}
      <DecisionPillarsShowcase locale={value} />

      {/* 4. How Verification Works */}
      <section className="py-24 lg:py-32 bg-canvas relative overflow-hidden">
        {/* Decorative background accent */}
        <div aria-hidden="true" className="pointer-events-none absolute top-0 end-0 w-[500px] h-[500px] bg-gradient-to-bl from-[var(--copper-tint)] to-transparent opacity-30 blur-3xl" />

        <Container size="wide">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

            {/* Left: Verification steps with step indicators */}
            <div className="lg:col-span-6 space-y-12">
              <div className="space-y-4">
                <p className="section-overline">
                  {isAr ? "منهجية التحقق" : "Verification process"}
                </p>
                <h2 className="text-heading">
                  {isAr ? "كيف نتحقق من كل تفصيل في راما" : "How RAMA verifies every property detail"}
                </h2>
              </div>

              <div className="space-y-0 pt-4">
                <div className="step-connector completed">
                  <div className="step-indicator completed" data-step="01">
                    <h4 className="text-lg font-medium text-ink leading-relaxed">{isAr ? "ربط السجلات الرسمية" : "Official Record Cross-Checking"}</h4>
                    <p className="text-sm text-text font-normal mt-2 pb-10">{isAr ? "نربط بيانات العقار بسجلات دائرة الأراضي والمطورين مباشرة." : "Every claim is matched against land department records and official approvals."}</p>
                  </div>
                </div>

                <div className="step-connector completed">
                  <div className="step-indicator completed" data-step="02">
                    <h4 className="text-lg font-medium text-ink leading-relaxed">{isAr ? "إظهار الاستثناءات بوضوح" : "Transparent Gap Identification"}</h4>
                    <p className="text-sm text-text font-normal mt-2 pb-10">{isAr ? "أي تفصيل غير مؤكد يظهر كعنصر يحتاج تأكيدًا، دون إخفاء." : "Unconfirmed items are highlighted neutrally so you know what to check next."}</p>
                  </div>
                </div>

                <div>
                  <div className="step-indicator active" data-step="03">
                    <h4 className="text-lg font-medium text-ink leading-relaxed">{isAr ? "حساب التكاليف الكاملة مسبقًا" : "Complete Cost Mapping"}</h4>
                    <p className="text-sm text-text font-normal mt-2">{isAr ? "حساب جميع الرسوم الحكومية، رسوم الخدمات، والرهن العقاري مسبقًا." : "Government fees, service charges, and transfer costs mapped before you reserve."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Cost Preview Card — Glassmorphism Enhanced */}
            <div className="lg:col-span-6">
              <MagicCard className="p-10 space-y-8 relative" gradientColor="var(--copper-tint)">
                {/* Subtle shimmer effect */}
                <div className="absolute inset-0 shimmer-bg pointer-events-none opacity-30 rounded-none" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between border-b border-border pb-6 gap-4">
                    <span className="text-lg font-medium text-ink">{isAr ? "توزيع تكلفة الاستحواذ" : "Sample cost breakdown"}</span>
                    <span className="compare-header-badge shrink-0">Downtown 2BR &middot; AED 2.5M</span>
                  </div>

                  <div className="space-y-0 text-sm">
                    <div className="flex justify-between py-4 border-b border-border/60 group/row hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-text font-medium">{isAr ? "سعر الإعلان" : "Advertised price"}</span>
                      <span className="font-semibold text-ink font-mono tabular-nums">AED 2,500,000</span>
                    </div>
                    <div className="flex justify-between py-4 border-b border-border/60 group/row hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-text font-medium">{isAr ? "رسوم نقل الملكية (DLD 4%)" : "DLD transfer fee (4%)"}</span>
                      <span className="font-semibold text-ink font-mono tabular-nums">AED 100,000</span>
                    </div>
                    <div className="flex justify-between py-4 border-b border-border/60 group/row hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-text font-medium">{isAr ? "رسوم الوساطة (2% + ضريبة)" : "Agency fee (2% + VAT)"}</span>
                      <span className="font-semibold text-ink font-mono tabular-nums">AED 52,500</span>
                    </div>
                    <div className="flex justify-between py-4 border-b border-border/60 group/row hover:bg-[var(--copper-tint)]/30 px-2 -mx-2 transition-colors">
                      <span className="text-text font-medium">{isAr ? "رسوم التسجيل والرهن العقاري" : "Trustee & mortgage registration"}</span>
                      <span className="font-semibold text-ink font-mono tabular-nums">AED 10,240</span>
                    </div>
                    <div className="flex items-center justify-between pt-6 mt-2 font-semibold text-base border-t-2 border-[var(--copper)]">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-brand" />
                      <span className="text-ink">{isAr ? "إجمالي التكلفة الأولية" : "Total upfront acquisition"}</span>
                    </div>
                    <span className="font-mono font-bold text-ink">AED 2,662,740</span>
                  </div>
                </div>

                <p className="text-xs italic text-text mt-8 text-center sm:text-start">
                  {isAr ? "* بناءً على افتراض تمويل عقاري بنسبة 80% لفترة 25 سنة." : "* Assumes standard 80% LTV mortgage over 25 years."}
                </p>
              </div>
            </MagicCard>
          </div>
          </div>
        </Container>
      </section>


      {/* 4.5. Core Guarantees — Elevated with luxury cards */}
      <section className="bg-canvas py-20 lg:py-28 border-t border-border">
        <hr className="luxury-divider" style={{ margin: '0 auto 48px', maxWidth: '120px' }} />
        <Container size="wide" className="px-6 lg:px-16">
          <div className="max-w-3xl mx-auto space-y-10">
            <h2 className="text-3xl sm:text-4xl font-serif font-light text-ink text-balance tracking-tight text-center">
              {isAr ? "يقين عقاري بضمانين أساسيين" : "Property Certainty in Two Guarantees"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <MagicCard className="p-8 space-y-3" gradientColor="var(--copper-tint)">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 flex items-center justify-center bg-[var(--sage-tint)] border border-[var(--sage)]/30">
                    <ShieldCheck className="size-5 text-[var(--sage)]" />
                  </div>
                  <span className="font-semibold text-ink text-base">
                    {isAr ? "السجلات الرسمية أولاً" : "Official Records First"}
                  </span>
                </div>
                <p className="text-xs text-text leading-relaxed">
                  {isAr
                    ? "كل معلومة ومطالبة يتم مطابقتها مباشرة مع سجلات دائرة الأراضي والأملاك وحسابات الضمان المعتمدة في دبي."
                    : "Every claim matched against Dubai Land Department ledgers, RERA escrow accounts, and official developer deeds."}
                </p>
              </MagicCard>

              <MagicCard className="p-8 space-y-3" gradientColor="var(--copper-tint)">
                <div className="flex items-center gap-3 mb-2">
                  <div className="size-10 flex items-center justify-center bg-[var(--copper-tint)] border border-[var(--copper)]/30">
                    <Calculator className="size-5 text-[var(--copper-dark)]" />
                  </div>
                  <span className="font-semibold text-ink text-base">
                    {isAr ? "شفافية الرسوم الكاملة" : "Complete Fee Transparency"}
                  </span>
                </div>
                <p className="text-xs text-text leading-relaxed">
                  {isAr
                    ? "حساب دقيق وشامل لجميع الرسوم الحكومية، رسوم التسجيل، والوساطة مسبقًا وقبل الاتفاق."
                    : "100% upfront calculation of DLD transfer fees, trustee registration, agency VAT, and service charges."}
                </p>
              </MagicCard>
            </div>
          </div>
        </Container>
      </section>

      {/* 4.8. Market Intelligence & Track Record — Premium stats */}
      <section className="bg-surface-subtle py-20 lg:py-28 border-t border-border">
        <Container size="wide" className="px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Content & Metric List */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-3">
                <p className="section-overline">
                  {isAr ? "الأثر والأرقام الموثقة" : "Verified Market Impact"}
                </p>
                <h2 className="text-3xl sm:text-4xl font-serif font-light text-ink tracking-tight">
                  {isAr ? "ثقة يبنيها اليقين بالأرقام" : "Trusted by Buyers & Owners"}
                </h2>
                <p className="text-sm text-text font-light leading-relaxed">
                  {isAr
                    ? "منصتنا توفر نتائج ملموسة تمنحك اليقين الكامل في اتخاذ القرار العقاري في دبي."
                    : "Our platform delivers measurable data certainty that helps you make confident real estate decisions."}
                </p>
              </div>

              <div className="space-y-0 text-sm">
                {[
                  { value: <><NumberTicker value={100} />%</>, label: isAr ? 'توثيق ملكية سندات دائرة الأراضي (DLD)' : 'Fact-checked DLD title deed verification.', accent: false },
                  { value: <>AED <NumberTicker value={1.2} decimalPlaces={1} />B+</>, label: isAr ? 'معاملات عقارية تم مطابقتها مع السجلات' : 'Property transaction volume cross-referenced.', accent: false },
                  { value: <><NumberTicker value={18} /> / 22</>, label: isAr ? 'متوسط النقاط الموثقة رسمياً لكل عقار' : 'Average verified data points per home.', accent: false },
                  { value: <><NumberTicker value={0} /> AED</>, label: isAr ? 'رسوم مخفية أو مفاجآت غير معلنة' : 'Hidden acquisition fees or undisclosed surcharges.', accent: true },
                ].map((stat, i) => (
                  <div key={i} className="gold-accent border-t border-border py-5 flex items-baseline justify-between gap-4 group cursor-default">
                    <div>
                      <span className={`stat-counter text-2xl font-bold me-2 ${stat.accent ? 'text-[var(--copper-dark)]' : 'text-ink'}`} style={{ animationDelay: `${i * 0.15}s` }}>{stat.value}</span>
                      <span className="text-xs text-text font-light">
                        {stat.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Architectural Image Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-[400px] lg:h-[460px] overflow-hidden border border-border shadow-md rounded-none group">
                <Image
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=100&w=2000&auto=format&fit=crop"
                  alt="Dubai Architecture & Market Data"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-1000 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 start-4 bg-surface/90 backdrop-blur-sm px-3.5 py-2 border border-border text-ink text-[10px] uppercase font-mono tracking-wider">
                  {isAr ? "دائرة الأراضي والأملاك · بيانات محدثة 2026" : "DLD Telemetry · Updated 2026"}
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 5. Closing Action CTA — Premium Glassmorphism */}
      <section className="bg-[var(--ink)] border-t border-border py-24 lg:py-36 @container relative overflow-hidden">
        {/* Animated Grid Pattern Background */}
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[160%] skew-y-12",
          )}
        />
        {/* Decorative gradient orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute top-1/2 start-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[var(--copper)]/15 to-transparent blur-[100px]" />
          <div className="absolute bottom-0 end-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-[var(--sage)]/10 to-transparent blur-[80px]" />
        </div>

        <Container size="wide" className="relative z-10 px-6 lg:px-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Luxury gold line */}
            <div className="mx-auto w-16 h-px bg-gradient-to-r from-transparent via-[var(--copper)] to-transparent mb-10" />

            {/* Trust Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-none border border-[var(--sage)]/30 bg-[var(--sage)]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[var(--sage)]">
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>{isAr ? "ضمان السجلات الرسمية والشفافية" : "Verified DLD Data & Zero Hidden Fees"}</span>
            </div>

            {/* Main Headline */}
            <h2 className="font-serif text-3xl font-light tracking-tight text-white text-balance sm:text-4xl md:text-5xl lg:leading-[1.15]">
              {isAr ? "ابحث عن منزلك بهدوء." : "Find your home with calm."}
            </h2>

            {/* Subtitle Prose */}
            <p className="mt-5 max-w-lg mx-auto text-base text-white/60 text-pretty leading-relaxed md:text-lg">
              {isAr
                ? "كل تفصيل موثق. كل تكلفة محددة. كل شك مزال."
                : "Every detail verified. Every cost mapped. Every doubt removed."}
            </p>

            {/* Interactive Actions */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                render={<Link href={`/${value}/homes`} />}
                size="lg"
                nativeButton={false}
                className="cta-glow group min-h-[52px] w-full sm:w-auto px-8 font-semibold text-[var(--ink)] bg-[var(--copper)] hover:bg-[var(--copper-dark)] transition-all duration-300 shadow-lg cursor-pointer inline-flex items-center justify-center gap-2.5"
              >
                <span>{isAr ? "استعرض العقارات الموثقة" : "Search homes"}</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Button>

              <Button
                render={<Link href={`/${value}/costs`} />}
                variant="outline"
                size="lg"
                nativeButton={false}
                className="min-h-[52px] w-full sm:w-auto border-white/20 bg-white/5 px-7 font-medium text-white hover:border-[var(--copper)]/50 hover:bg-white/10 transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Calculator className="size-4 text-[var(--copper)]" />
                <span>{isAr ? "حاسبة التكاليف" : "Calculate my costs"}</span>
              </Button>
            </div>

            {/* Value Props Footer Pills */}
            <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-medium text-white/50">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="size-3.5 text-[var(--copper)] shrink-0" />
                <span>{isAr ? "100% مطابقة DLD" : "100% DLD Cross-Checked"}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Calculator className="size-3.5 text-[var(--copper)] shrink-0" />
                <span>{isAr ? "توزيع شامل للتكاليف" : "Complete Upfront Fee Map"}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Compass className="size-3.5 text-[var(--copper)] shrink-0" />
                <span>{isAr ? "جولات 3D تفاعلية" : "3D Spatial Virtual Tours"}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      </div>{/* end main content wrapper */}
      {/* Footer */}
      <div className="sticky bottom-0 z-0">
        <AppFooter locale={value as any} />
      </div>
    </div>
  );
}
