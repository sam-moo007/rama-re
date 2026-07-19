import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { isLocale } from "@/lib/i18n";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { catalogueFixtures } from "@rama/contracts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RAMA — Evidence-First Dubai Real Estate",
  description:
    "Dubai's most trusted real estate platform. Verified evidence, transparent costs, and inspectable trust for every property decision.",
};

// Map slugs to local images
const PROPERTY_IMAGES: Record<string, string> = {
  "residence-1204": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=100&w=2000&auto=format&fit=crop",
  "marina-penthouse-5401": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=100&w=2000&auto=format&fit=crop",
  "downtown-penthouse-ph03": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=100&w=2000&auto=format&fit=crop",
  "garden-court-805-demo": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=100&w=2000&auto=format&fit=crop",
  "marina-home-demo": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=100&w=2000&auto=format&fit=crop",
  "canal-loft-demo": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=100&w=2000&auto=format&fit=crop",
  "palm-villa-b7": "https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=100&w=2000&auto=format&fit=crop",
};

const COMMUNITY_DATA = [
  {
    nameEn: "Downtown Dubai",
    nameAr: "وسط دبي",
    taglineEn: "Iconic skyline living",
    taglineAr: "المعيشة تحت الأفق الأيقوني",
    image: "https://images.unsplash.com/photo-1546412414-e1885259563a?q=100&w=2000&auto=format&fit=crop",
    propertiesEn: "142 properties",
    propertiesAr: "١٤٢ عقار",
  },
  {
    nameEn: "Dubai Marina",
    nameAr: "دبي مارينا",
    taglineEn: "Waterfront luxury",
    taglineAr: "رفاهية على الواجهة البحرية",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=100&w=2000&auto=format&fit=crop",
    propertiesEn: "218 properties",
    propertiesAr: "٢١٨ عقار",
  },
  {
    nameEn: "Palm Jumeirah",
    nameAr: "نخلة جميرا",
    taglineEn: "Island exclusivity",
    taglineAr: "حصرية الجزيرة",
    image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?q=100&w=2000&auto=format&fit=crop",
    propertiesEn: "87 properties",
    propertiesAr: "٨٧ عقار",
  },
];

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

  // Redirect to discover if authenticated
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) redirect(`/${value}/discover`);

  const isAr = value === "ar";
  const dir = isAr ? "rtl" : "ltr";

  // Featured listings — show top 3 curated properties
  const featured = catalogueFixtures
    .filter((p) => p.recordKind === "curated" && p.decisionRoomAvailable)
    .slice(0, 3);

  return (
    <main lang={value} dir={dir} className="landingRoot">
      {/* ───────────── NAV ───────────── */}
      <header className="landingNav">
        <div className="landingNavInner">
          <a href={`/${value}`} className="landingBrand">
            <span className="landingBrandMark">R</span>
            <span className="landingBrandName">RAMA</span>
          </a>
          <nav className="landingLinks" aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"}>
            <a href={`/${value}/cost-engine`}>{isAr ? "حاسبة التكاليف" : "Cost Engine"}</a>
            <a href={`/${value}/readiness`}>{isAr ? "الاستعداد" : "Readiness"}</a>
          </nav>
          <div className="landingNavActions">
            <Link
              href={`/${value}/login` as any}
              className="landingSignIn"
            >
              {isAr ? "تسجيل الدخول" : "Sign in"}
            </Link>
            <Link
              href={`/${value}/login` as any}
              className="landingCTA"
            >
              {isAr ? "ابدأ مجاناً" : "Get started"}
            </Link>
          </div>
        </div>
      </header>

      {/* ───────────── HERO ───────────── */}
      <section className="landingHero" aria-label={isAr ? "القسم الرئيسي" : "Hero section"}>
        <div className="landingHeroBg">
          <Image
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=100&w=3840&auto=format&fit=crop"
            alt={isAr ? "أفق دبي المارينا" : "Dubai Marina skyline"}
            fill
            priority
            quality={100}
            style={{ objectFit: "cover", objectPosition: "center 40%" }}
          />
          <div className="landingHeroOverlay" />
        </div>
        <div className="landingHeroContent">
          <div className="heroElevatedCard">
            <h1 className="landingH1">
              {isAr ? (
                <>
                  كل ادعاء<br />
                  <span className="landingH1Accent">موثّق.</span>
                </>
              ) : (
                <>
                  Every claim.<br />
                  <span className="landingH1Accent">Inspectable.</span>
                </>
              )}
            </h1>
            <p className="landingHeroSub">
              {isAr
                ? "راما تحوّل بيانات السوق إلى قرارات مبنية على الأدلة. تحقق من كل ادعاء، افهم التكاليف الحقيقية، وانقل بثقة."
                : "RAMA turns market data into evidence-backed decisions. Inspect every claim, understand true costs, and transact with confidence."}
            </p>
            <div className="landingHeroActions">
              <Link href={`/${value}/login` as any} className="heroPrimaryBtn">
                {isAr ? "ابدأ البحث مجاناً" : "Start your search"}
              </Link>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="heroStats" aria-label={isAr ? "إحصائيات المنصة" : "Platform statistics"}>
          <div className="heroStatItem">
            <strong>1,240+</strong>
            <span>{isAr ? "عقار موثق" : "Verified listings"}</span>
          </div>
          <div className="heroStatDivider" aria-hidden="true" />
          <div className="heroStatItem">
            <strong>87%</strong>
            <span>{isAr ? "متوسط تغطية الأدلة" : "Avg. evidence coverage"}</span>
          </div>
          <div className="heroStatDivider" aria-hidden="true" />
          <div className="heroStatItem">
            <strong>100%</strong>
            <span>{isAr ? "من معاملات DLD موثقة" : "DLD transactions verified"}</span>
          </div>
          <div className="heroStatDivider" aria-hidden="true" />
          <div className="heroStatItem">
            <strong>48h</strong>
            <span>{isAr ? "متوسط وقت مراجعة الأدلة" : "Avg. evidence review time"}</span>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURED LISTINGS ───────────── */}
      <section className="landingSection featuredSection" aria-labelledby="featured-heading">
        <div className="landingInner">
          <div className="sectionIntro">
            <p className="landingSectionEyebrow">{isAr ? "عقارات مميزة" : "Featured properties"}</p>
            <h2 id="featured-heading" className="landingSectionTitle">
              {isAr ? "قرارات مبنية على دليل حقيقي" : "Decisions backed by real evidence"}
            </h2>
            <Link href={`/${value}/login` as any} className="sectionViewAll">
              {isAr ? "استعرض الكل" : "View all"} →
            </Link>
          </div>

          <div className="featuredGrid">
            {featured.map((property) => {
              const name = isAr ? property.name.ar : property.name.en;
              const community = isAr ? property.community.ar : property.community.en;
              const image = PROPERTY_IMAGES[property.slug] ?? "/images/property-living-room.jpg";
              const price = formatAedShort(property.priceAed, isAr);
              const beds = property.bedrooms;
              const area = property.internalAreaSqFt;
              const isOffPlan = property.tenure === "off_plan";
              const slug = property.slug;

              return (
                <article key={property.id} className="featuredCard">
                  <div className="featuredCardMedia">
                    <Image
                      src={image}
                      alt={`${name} — ${community}`}
                      fill
                      quality={85}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="featuredCardGradient" />
                    <div className="featuredCardBadges">
                      <span className={`featuredBadge ${isOffPlan ? "badgeOffPlan" : "badgeReady"}`}>
                        {isOffPlan
                          ? isAr ? "قيد الإنشاء" : "Off-plan"
                          : isAr ? "جاهز" : "Ready"}
                      </span>
                      {property.recordKind === "curated" && (
                        <span className="featuredBadge badgeCurated">
                          {isAr ? "موثق راما" : "RAMA Verified"}
                        </span>
                      )}
                    </div>
                    <div className="featuredEvidenceBar">
                      <span className="featuredEvidenceLabel">
                        {isAr ? "تغطية الأدلة" : "Evidence"}
                      </span>
                      <div className="featuredEvidenceTrack">
                        <div
                          className="featuredEvidenceFill"
                          style={{ width: `${property.evidenceCoverage}%` }}
                        />
                      </div>
                      <span className="featuredEvidenceVal">{property.evidenceCoverage}%</span>
                    </div>
                  </div>
                  <div className="featuredCardBody">
                    <p className="featuredCommunity">{community}</p>
                    <h3 className="featuredName">{name}</h3>
                    <div className="featuredMeta">
                      {beds != null && (
                        <span>{beds} {isAr ? "غرف" : beds === 1 ? "bed" : "beds"}</span>
                      )}
                      {area != null && (
                        <span>{area.toLocaleString()} {isAr ? "قدم²" : "sq ft"}</span>
                      )}
                    </div>
                    <div className="featuredFooter">
                      <span className="featuredPrice">{price}</span>
                      <Link
                        href={`/${value}/properties/${slug}` as any}
                        className="featuredViewBtn"
                        aria-label={`${isAr ? "عرض تفاصيل" : "View"} ${name}`}
                      >
                        {isAr ? "عرض الملف" : "View record"}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="landingSection howSection" aria-labelledby="how-heading">
        <div className="landingInner">
          <div className="sectionIntro centered">
            <p className="landingSectionEyebrow">{isAr ? "كيف تعمل راما" : "How RAMA works"}</p>
            <h2 id="how-heading" className="landingSectionTitle">
              {isAr ? "شفافية في كل خطوة" : "Transparent at every step"}
            </h2>
          </div>
          <div className="howGrid">
            {[
              {
                num: "01",
                titleEn: "Browse with evidence",
                titleAr: "تصفح بالأدلة",
                descEn:
                  "Every listing shows an evidence coverage score. See exactly which claims are verified, under review, or unknown — before you click.",
                descAr:
                  "كل قائمة تعرض نقاط تغطية الأدلة. شاهد بالضبط أي الادعاءات موثقة أو قيد المراجعة أو غير معروفة — قبل النقر.",
              },
              {
                num: "02",
                titleEn: "Inspect the decision room",
                titleAr: "افحص غرفة القرار",
                descEn:
                  "Each property has a structured decision record: trust passport, live tour, cost waterfall, DLD transactions, and risk map.",
                descAr:
                  "لكل عقار سجل قرار منظم: جواز الثقة، جولة مباشرة، شلال التكاليف، معاملات دائرة الأراضي، وخريطة المخاطر.",
              },
              {
                num: "03",
                titleEn: "Transact with certainty",
                titleAr: "أتمّ المعاملة بيقين",
                descEn:
                  "Hand off to a human advisor with your full context already compiled. No repeat questions. No surprises at contract.",
                descAr:
                  "تواصل مع مستشار بشري مع تجميع سياقك الكامل مسبقاً. لا أسئلة متكررة. لا مفاجآت عند التعاقد.",
              },
            ].map((step) => (
              <div key={step.num} className="howCard">
                <span className="howNum" aria-hidden="true">{step.num}</span>
                <h3 className="howTitle">{isAr ? step.titleAr : step.titleEn}</h3>
                <p className="howDesc">{isAr ? step.descAr : step.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── COMMUNITIES ───────────── */}
      <section className="landingSection communitiesSection" aria-labelledby="communities-heading">
        <div className="landingInner">
          <div className="sectionIntro">
            <p className="landingSectionEyebrow">{isAr ? "المجتمعات" : "Communities"}</p>
            <h2 id="communities-heading" className="landingSectionTitle">
              {isAr ? "استكشف الأحياء المميزة" : "Explore premium neighbourhoods"}
            </h2>
          </div>
          <div className="communitiesGrid">
            {COMMUNITY_DATA.map((c) => (
              <div key={c.nameEn} className="communityCard">
                <div className="communityCardMedia">
                  <Image
                    src={c.image}
                    alt={isAr ? c.nameAr : c.nameEn}
                    fill
                    quality={80}
                    style={{ objectFit: "cover" }}
                  />
                  <div className="communityGradient" />
                </div>
                <div className="communityBody">
                  <h3 className="communityName">{isAr ? c.nameAr : c.nameEn}</h3>
                  <p className="communityTagline">{isAr ? c.taglineAr : c.taglineEn}</p>
                  <span className="communityCount">{isAr ? c.propertiesAr : c.propertiesEn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TRUST BAND ───────────── */}
      <section className="trustBand" aria-label={isAr ? "مزايا المنصة" : "Platform trust signals"}>
        <div className="landingInner trustBandInner">
          {[
            {
              iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
              titleEn: "Evidence-audited",
              titleAr: "مراجعة الأدلة",
              descEn: "Every claim traceable to source",
              descAr: "كل ادعاء قابل للتتبع حتى المصدر",
            },
            {
              iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
              titleEn: "DLD verified",
              titleAr: "دائرة الأراضي موثق",
              descEn: "Historical transactions from the official registry",
              descAr: "المعاملات التاريخية من السجل الرسمي",
            },
            {
              iconPath: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3",
              titleEn: "True cost waterfall",
              titleAr: "شلال التكاليف الحقيقية",
              descEn: "Reservation through exit — no surprises",
              descAr: "من الحجز حتى الخروج — لا مفاجآت",
            },
            {
              iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              titleEn: "Human advisors",
              titleAr: "مستشارون بشريون",
              descEn: "Escalate with all context already compiled",
              descAr: "تصعيد مع تجميع السياق الكامل",
            },
          ].map((item) => (
            <div key={item.titleEn} className="trustItem">
              <div className="trustIcon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={24} height={24}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                </svg>
              </div>
              <div>
                <h3 className="trustTitle">{isAr ? item.titleAr : item.titleEn}</h3>
                <p className="trustDesc">{isAr ? item.descAr : item.descEn}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── CTA BANNER ───────────── */}
      <section className="ctaBanner" aria-labelledby="cta-heading">
        <div className="ctaBannerBg">
          <Image
            src="/images/property-pool-terrace.jpg"
            alt=""
            aria-hidden="true"
            fill
            quality={70}
            style={{ objectFit: "cover" }}
          />
          <div className="ctaBannerOverlay" />
        </div>
        <div className="ctaBannerContent">
          <h2 id="cta-heading" className="ctaTitle">
            {isAr ? "ابدأ بحثك بثقة اليوم" : "Start your confident search today"}
          </h2>
          <p className="ctaSub">
            {isAr
              ? "انضم إلى آلاف المشترين الذين يتخذون قراراتهم بناءً على أدلة موثقة."
              : "Join thousands of buyers making decisions with verified evidence."}
          </p>
          <Link href={`/${value}/login` as any} className="ctaBtn">
            {isAr ? "إنشاء حساب مجاني" : "Create free account"}
          </Link>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="landingFooter">
        <div className="landingInner landingFooterInner">
          <div className="footerBrand">
            <span className="landingBrandMark small">R</span>
            <span className="footerBrandName">RAMA</span>
            <p className="footerTagline">
              {isAr ? "قرارات عقارية مبنية على يقين." : "Property decisions built on certainty."}
            </p>
          </div>
          <nav className="footerLinks" aria-label={isAr ? "روابط التذييل" : "Footer links"}>
            <a href={`/${value}/cost-engine`}>{isAr ? "حاسبة التكاليف" : "Cost Engine"}</a>
            <a href={`/${value}/readiness`}>{isAr ? "قائمة الاستعداد" : "Readiness"}</a>
            <a href={`/${value}/login`}>{isAr ? "تسجيل الدخول" : "Sign in"}</a>
          </nav>
          <p className="footerLegal">
            {isAr
              ? "© 2026 راما. للأغراض التوضيحية فقط — ليست مشورة استثمارية أو قانونية."
              : "© 2026 RAMA. Demonstration purposes only — not investment or legal advice."}
          </p>
        </div>
      </footer>
    </main>
  );
}
