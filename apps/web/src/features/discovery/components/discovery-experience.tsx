"use client";

import {
  PropertyCompareResponseSchema,
  PropertyShortlistSchema,
  type CatalogueSearchResponse,
  type PropertyCompareResponse,
  type PropertySearchResultItem,
  type PropertyShortlist,
} from "@rama/contracts";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  CircleAlert,
  GitCompareArrows,
  Home,
  LockKeyhole,
  MapPin,
  Search,
  X,
  MapIcon,
  ListIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { getGuestShortlist, saveGuestShortlist, mergeGuestShortlist, clearGuestShortlist } from "@/lib/guest-state";
import dynamic from "next/dynamic";
import { isFeatureEnabled } from "@/lib/feature-flags";

const SearchMap = dynamic(
  () => import("@/features/search/search-map").then((mod) => mod.SearchMap),
  { ssr: false }
);

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppHeader } from "@/components/app-header";
import { Container } from "@/components/ui/container";
import type { Locale } from "@/lib/i18n";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";

type Props = {
  initialSearch: CatalogueSearchResponse;
  initialShortlist: PropertyShortlist | null;
  locale: Locale;
};

type Notice = { kind: "success" | "error"; text: string } | null;

const copy = {
  en: {
    skip: "Skip to discovery results",
    brand: "RAMA",
    secure: "Private discovery workspace",
    language: "العربية",
    signOut: "Sign out",
    brief: "Household brief",
    title: "Discover homes",
    titleSub: "Verified properties with transparent evidence, costs, and location fit",
    intro: "Results show exactly where details match, need review, or are pending.",
    nonAdvice: "Fit is decision support — not a quality score or recommendation.",
    filters: "Search and filters",
    query: "Property or community",
    community: "Community",
    anyCommunity: "Any community",
    destination: "Travel destination",
    anyDestination: "No travel-time filter",
    travelMode: "Travel mode",
    drive: "Drive",
    publicTransport: "Public transport",
    walk: "Walk",
    maxTravel: "Maximum travel time (minutes)",
    infrastructure: "Infrastructure evidence",
    anyInfrastructure: "Any evidence state",
    present: "Present",
    committed: "Committed",
    modelled: "Modelled",
    minPrice: "Minimum price (AED)",
    maxPrice: "Maximum price (AED)",
    bedrooms: "Minimum bedrooms",
    anyBedrooms: "Any bedroom count",
    tenure: "Tenure",
    anyTenure: "Any tenure",
    evidence: "Minimum evidence coverage",
    anyEvidence: "Any coverage",
    freshness: "Evidence freshness",
    anyFreshness: "Any freshness",
    sort: "Sort results",
    apply: "Apply filters",
    reset: "Reset",
    results: "homes match your search",
    briefApplied: "",
    noBrief: "",
    synthetic: "Synthetic demo",
    curated: "Curated",
    ready: "Ready",
    offPlan: "Off-plan",
    fresh: "Fresh",
    review: "Review",
    stale: "Stale",
    unknown: "Unknown",
    bedroomsLabel: "Bedrooms",
    bathrooms: "Bathrooms",
    area: "Internal area",
    evidenceCoverage: "Evidence coverage",
    fit: "Brief fit",
    evidenceRank: "Evidence rank",
    fitExplanation: "Why this ranked here",
    missing: "Critical evidence still missing",
    decisionRoom: "Open decision room",
    unavailableRoom: "Decision room in evidence review",
    save: "Save",
    saved: "Saved",
    saving: "Saving…",
    compare: "Compare",
    compareSelected: "Compare selected",
    compareHint: "Select 2–3 homes to compare side-by-side.",
    compareLimit: "You can compare up to three homes.",
    tradeOffs: "Key trade-offs",
    shortlistSaved: "Shortlist updated.",
    saveFailed: "The shortlist changed or could not be saved. Refresh and try again.",
    compareFailed: "Comparison could not be loaded.",
    differences: "Differences-first comparison",
    differencesHelp: "Only differing or unknown fields are shown by default.",
    showAll: "Show all fields",
    showDifferences: "Show differences only",
    closeCompare: "Close comparison",
    price: "Price",
    access: "Step-free access",
    representation: "Media representation",
    missingCount: "Missing critical evidence",
    noResults: "No homes match your search",
    noResultsHelp: "Try adjusting your price or community filters.",
    mobility: "Travel evidence",
    mobilityUnknown: "Route evidence is unavailable for this destination and mode.",
    travelEstimate: "minutes",
    method: "Method",
    source: "Source",
    observed: "Observed",
    routingCaution: "Travel times are evidence-labelled estimates, not guarantees.",
    showing: "Showing",
    of: "of",
    previous: "Previous results",
    next: "Next results",
    sortOptions: { fit_desc: "Best brief fit", evidence_desc: "Evidence coverage", price_asc: "Price: low to high", price_desc: "Price: high to low", newest: "Newest evidence" },
  },
  ar: {
    skip: "الانتقال إلى نتائج البحث",
    brand: "راما",
    secure: "مساحة اكتشاف خاصة",
    language: "English",
    signOut: "تسجيل الخروج",
    brief: "ملخص الأسرة",
    title: "اكتشف المنازل",
    titleSub: "عقارات موثقة مع أدلة شفافة وتكاليف كاملة وملاءمة مكانية",
    intro: "تُظهر النتائج أين تتطابق التفاصيل، تحتاج مراجعة، أو لا تزال معلقة.",
    nonAdvice: "الملاءمة أداة لدعم القرار وليست درجة لجودة العقار أو توصية استثمارية.",
    filters: "البحث وعوامل التصفية",
    query: "العقار أو المنطقة",
    community: "المنطقة",
    anyCommunity: "أي منطقة",
    destination: "وجهة التنقل",
    anyDestination: "من دون تصفية زمن التنقل",
    travelMode: "وسيلة التنقل",
    drive: "السيارة",
    publicTransport: "النقل العام",
    walk: "المشي",
    maxTravel: "الحد الأقصى لزمن التنقل (دقائق)",
    infrastructure: "دليل البنية التحتية",
    anyInfrastructure: "أي حالة دليل",
    present: "قائم",
    committed: "ملتزم به",
    modelled: "نمذجي",
    minPrice: "الحد الأدنى للسعر (درهم)",
    maxPrice: "الحد الأقصى للسعر (درهم)",
    bedrooms: "الحد الأدنى لغرف النوم",
    anyBedrooms: "أي عدد غرف",
    tenure: "حالة العقار",
    anyTenure: "أي حالة",
    evidence: "الحد الأدنى لاكتمال الأدلة",
    anyEvidence: "أي نسبة",
    freshness: "حداثة الأدلة",
    anyFreshness: "أي حداثة",
    sort: "ترتيب النتائج",
    apply: "تطبيق عوامل التصفية",
    reset: "إعادة الضبط",
    results: "منزل يطابق بحثك",
    briefApplied: "",
    noBrief: "",
    synthetic: "نموذج توضيحي",
    curated: "منسق",
    ready: "جاهز",
    offPlan: "على المخطط",
    fresh: "حديث",
    review: "مراجعة",
    stale: "قديم",
    unknown: "غير معروف",
    bedroomsLabel: "غرف النوم",
    bathrooms: "الحمامات",
    area: "المساحة الداخلية",
    evidenceCoverage: "اكتمال الأدلة",
    fit: "ملاءمة الملخص",
    evidenceRank: "ترتيب الأدلة",
    fitExplanation: "سبب هذا الترتيب",
    missing: "أدلة أساسية لا تزال مفقودة",
    decisionRoom: "فتح غرفة القرار",
    unavailableRoom: "غرفة القرار قيد مراجعة الأدلة",
    save: "حفظ",
    saved: "محفوظ",
    saving: "جارٍ الحفظ…",
    compare: "مقارنة",
    compareSelected: "مقارنة المحدد",
    compareHint: "حدد عقارين إلى ثلاثة لمقارنتهما جنباً إلى جنب.",
    compareLimit: "يمكنك مقارنة ثلاثة عقارات كحد أقصى.",
    tradeOffs: "أهم المفاضلات",
    shortlistSaved: "تم تحديث القائمة المختصرة.",
    saveFailed: "تغيرت القائمة أو تعذر حفظها. حدّث الصفحة وحاول مجدداً.",
    compareFailed: "تعذر تحميل المقارنة.",
    differences: "مقارنة تبرز الاختلافات أولاً",
    differencesHelp: "تظهر الحقول المختلفة أو المجهولة فقط بشكل افتراضي.",
    showAll: "إظهار جميع الحقول",
    showDifferences: "إظهار الاختلافات فقط",
    closeCompare: "إغلاق المقارنة",
    price: "السعر",
    access: "دخول بلا درجات",
    representation: "نوع تمثيل الوسائط",
    missingCount: "الأدلة الأساسية المفقودة",
    noResults: "لا يوجد منزل يطابق بحثك",
    noResultsHelp: "حاول تعديل خيارات السعر أو المنطقة لرؤية المزيد.",
    mobility: "دليل التنقل",
    mobilityUnknown: "دليل المسار غير متاح لهذه الوجهة ووسيلة التنقل.",
    travelEstimate: "دقيقة",
    method: "المنهج",
    source: "المصدر",
    observed: "تاريخ الرصد",
    routingCaution: "أزمنة التنقل تقديرات موصوفة بالأدلة وليست ضمانات.",
    showing: "عرض",
    of: "من",
    previous: "النتائج السابقة",
    next: "النتائج التالية",
    sortOptions: { fit_desc: "أفضل ملاءمة للملخص", evidence_desc: "اكتمال الأدلة", price_asc: "السعر: من الأقل", price_desc: "السعر: من الأعلى", newest: "أحدث الأدلة" },
  },
} as const;

const aed = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);

const PROPERTY_IMAGE_MAP: Record<string, string> = {
  "residence-1204": "/images/property-living-room.jpg",
  "garden-court-805-demo": "/images/property-kitchen.jpg",
  "marina-home-demo": "/images/property-marina-penthouse.jpg",
  "canal-loft-demo": "/images/property-master-bedroom.jpg",
  "marina-penthouse-5401": "/images/community-marina.jpg",
  "palm-villa-b7": "/images/community-palm.jpg",
  "downtown-penthouse-ph03": "/images/property-downtown-exterior.jpg",
};

export function DiscoveryExperience({ initialSearch, initialShortlist, locale }: Props) {
  const t = copy[locale];
  const router = useRouter();
  const rtl = locale === "ar";
  const [shortlist, setShortlist] = useState(initialShortlist);
  const [isGuest] = useState(!initialShortlist);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [comparison, setComparison] = useState<PropertyCompareResponse | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    const localSlugs = getGuestShortlist();
    if (localSlugs.length > 0) {
      if (initialShortlist) {
        const merged = mergeGuestShortlist(initialShortlist.propertySlugs);
        fetch("/api/customer/shortlists/mine", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ expectedVersion: initialShortlist.version, propertySlugs: merged }),
        })
          .then((res) => {
            if (res.ok) {
              res.json().then((data) => {
                setShortlist(PropertyShortlistSchema.parse(data));
                clearGuestShortlist();
              });
            }
          })
          .catch((e) => console.error("Guest state merge failed", e));
      } else {
        setShortlist({ version: 1, propertySlugs: localSlugs } as PropertyShortlist);
      }
    }
  }, [initialShortlist]);

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isSimplified = isFeatureEnabled("NORDIC_SIMPLIFIED_DISCOVERY");
  const query = initialSearch.appliedQuery;
  const [filters, setFilters] = useState({
    q: query.q ?? "",
    community: query.communities[0] ?? "all",
    minPriceAed: query.minPriceAed?.toString() ?? "",
    maxPriceAed: query.maxPriceAed?.toString() ?? "",
    minBedrooms: query.minBedrooms?.toString() ?? "all",
    tenure: query.tenure[0] ?? "all",
    minEvidenceCoverage: query.minEvidenceCoverage?.toString() ?? "all",
    freshness: query.freshness[0] ?? "all",
    destination: query.destination ?? "all",
    travelMode: query.travelMode,
    maxTravelMinutes: query.maxTravelMinutes?.toString() ?? "",
    infrastructureState: query.infrastructureStates[0] ?? "all",
    sort: query.sort,
  });

  const { sponsoredItems, organicItems } = useMemo(() => {
    const sponsored: PropertySearchResultItem[] = [];
    const organic: PropertySearchResultItem[] = [];
    for (const item of initialSearch.items) {
      if (item.sponsored) {
        sponsored.push(item);
      } else {
        organic.push(item);
      }
    }
    return { sponsoredItems: sponsored, organicItems: organic };
  }, [initialSearch.items]);

  const BackIcon = rtl ? ArrowRight : ArrowLeft;
  const NextIcon = rtl ? ArrowLeft : ArrowRight;
  const savedSlugs = shortlist?.propertySlugs ?? [];

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.community !== "all") params.set("communities", filters.community);
    if (filters.minPriceAed) params.set("minPriceAed", filters.minPriceAed);
    if (filters.maxPriceAed) params.set("maxPriceAed", filters.maxPriceAed);
    if (filters.minBedrooms !== "all") params.set("minBedrooms", filters.minBedrooms);
    if (filters.tenure !== "all") params.set("tenure", filters.tenure);
    if (filters.minEvidenceCoverage !== "all") params.set("minEvidenceCoverage", filters.minEvidenceCoverage);
    if (filters.freshness !== "all") params.set("freshness", filters.freshness);
    if (filters.destination !== "all") {
      params.set("destination", filters.destination);
      params.set("travelMode", filters.travelMode);
      if (filters.maxTravelMinutes) params.set("maxTravelMinutes", filters.maxTravelMinutes);
      if (filters.infrastructureState !== "all") params.set("infrastructureStates", filters.infrastructureState);
    }
    params.set("sort", filters.sort);
    router.push(`/${locale}/homes?${params.toString()}` as Route);
  };

  const resetFilters = () => router.push(`/${locale}/homes` as Route);
  const nextPage = () => {
    if (!initialSearch.pageInfo.nextCursor) return;
    const params = new URLSearchParams(window.location.search);
    params.set("cursor", initialSearch.pageInfo.nextCursor);
    router.push(`/${locale}/homes?${params.toString()}` as Route);
  };

  const toggleShortlist = async (slug: string) => {
    setBusySlug(slug);
    setNotice(null);
    const next = savedSlugs.includes(slug) ? savedSlugs.filter((item) => item !== slug) : [...savedSlugs, slug];

    if (isGuest) {
      saveGuestShortlist(next);
      setShortlist({ version: shortlist?.version ?? 1, propertySlugs: next } as PropertyShortlist);
      setNotice({ kind: "success", text: locale === "ar" ? "تم الحفظ محلياً." : "Saved locally." });
      setBusySlug(null);
      return;
    }

    try {
      const response = await fetch("/api/customer/shortlists/mine", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedVersion: shortlist?.version ?? null, propertySlugs: next }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setShortlist(PropertyShortlistSchema.parse(await response.json()));
      setNotice({ kind: "success", text: t.shortlistSaved });
    } catch {
      setNotice({ kind: "error", text: t.saveFailed });
    } finally {
      setBusySlug(null);
    }
  };

  const toggleCompare = (slug: string, checked: boolean) => {
    setNotice(null);
    if (checked && compareSlugs.length >= 3) {
      setNotice({ kind: "error", text: t.compareLimit });
      return;
    }
    setCompareSlugs((current) => (checked ? [...current, slug] : current.filter((item) => item !== slug)));
  };

  const runCompare = async () => {
    if (compareSlugs.length < 2) return;
    setComparing(true);
    setNotice(null);
    try {
      const response = await fetch("/api/customer/properties/compare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slugs: compareSlugs }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setComparison(PropertyCompareResponseSchema.parse(await response.json()));
      window.requestAnimationFrame(() => document.querySelector("#comparison")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch {
      setNotice({ kind: "error", text: t.compareFailed });
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between" dir={rtl ? "rtl" : "ltr"} lang={locale}>
      <a className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-brand focus:text-white focus:px-4 focus:py-2" href="#results">
        {t.skip}
      </a>
      
      <AppHeader locale={locale} badge={rtl ? "كتالوج موثق" : "Verified Catalogue"} />

      <main className="flex-1">
        <Container size="full" className="space-y-10 py-8">
          
          {/* Hero Header Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end border-b border-border pb-8" aria-labelledby="discover-title">
            <div className="lg:col-span-7 space-y-2">
              <p className="text-xs uppercase tracking-widest font-semibold text-brand">
                {rtl ? "راما / العقارات الموثقة" : "RAMA / VERIFIED CATALOGUE"}
              </p>
              <h1 id="discover-title" className="text-4xl sm:text-5xl font-serif text-ink tracking-tight font-light">
                {t.title}
              </h1>
              <p className="text-sm text-text max-w-xl leading-relaxed pt-1">
                {t.titleSub}
              </p>
            </div>

            <div className="lg:col-span-5 space-y-3 bg-surface-subtle p-5 border border-border rounded-none">
              <p className="text-xs text-text leading-relaxed font-medium">
                {t.intro}
              </p>
              <div className="flex items-start gap-2 text-[11px] text-muted border-t border-border pt-3">
                <CircleAlert className="size-4 text-brand shrink-0 mt-0.5" />
                <span>{t.nonAdvice}</span>
              </div>
            </div>
          </section>

          {/* High Contrast Filter Bar */}
          <MagicCard className="border border-border bg-surface p-6 shadow-sm rounded-none" gradientColor="var(--copper-tint)">
            <form onSubmit={applyFilters} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field id="discover-q" label={t.query}>
                  <Input
                    id="discover-q"
                    value={filters.q}
                    placeholder={rtl ? "ابحث بالمنطقة أو العقار..." : "Search Dubai catalogue..."}
                    onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                    className="h-10 rounded-none border-border bg-surface text-ink text-sm font-medium focus:border-brand"
                  />
                </Field>

                <SelectFilter
                  id="community-filter"
                  label={t.community}
                  value={filters.community}
                  onChange={(value) => setFilters((current) => ({ ...current, community: value }))}
                  options={[
                    { value: "all", label: t.anyCommunity },
                    ...initialSearch.facets.communities.map((facet) => ({
                      value: facet.value,
                      label: `${facet.label[locale]} (${facet.count})`,
                    })),
                  ]}
                />

                <Field id="min-price" label={t.minPrice}>
                  <Input
                    id="min-price"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    placeholder="e.g. 1,000,000"
                    value={filters.minPriceAed}
                    onChange={(event) => setFilters((current) => ({ ...current, minPriceAed: event.target.value }))}
                    className="h-10 rounded-none border-border bg-surface text-ink text-sm font-medium focus:border-brand font-mono"
                  />
                </Field>

                <Field id="max-price" label={t.maxPrice}>
                  <Input
                    id="max-price"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="e.g. 5,000,000"
                    value={filters.maxPriceAed}
                    onChange={(event) => setFilters((current) => ({ ...current, maxPriceAed: event.target.value }))}
                    className="h-10 rounded-none border-border bg-surface text-ink text-sm font-medium focus:border-brand font-mono"
                  />
                </Field>
              </div>

              {/* Advanced Filters Drawer */}
              {(!isSimplified || showAdvanced) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border animate-in fade-in duration-300">
                  <SelectFilter id="bedroom-filter" label={t.bedrooms} value={filters.minBedrooms} onChange={(value) => setFilters((current) => ({ ...current, minBedrooms: value }))} options={[{ value: "all", label: t.anyBedrooms }, { value: "1", label: "1+" }, { value: "2", label: "2+" }, { value: "3", label: "3+" }]} />
                  <SelectFilter id="tenure-filter" label={t.tenure} value={filters.tenure} onChange={(value) => setFilters((current) => ({ ...current, tenure: value }))} options={[{ value: "all", label: t.anyTenure }, { value: "ready", label: t.ready }, { value: "off_plan", label: t.offPlan }]} />
                  <SelectFilter id="evidence-filter" label={t.evidence} value={filters.minEvidenceCoverage} onChange={(value) => setFilters((current) => ({ ...current, minEvidenceCoverage: value }))} options={[{ value: "all", label: t.anyEvidence }, { value: "60", label: "60%+" }, { value: "75", label: "75%+" }, { value: "90", label: "90%+" }]} />
                  <SelectFilter id="sort-filter" label={t.sort} value={filters.sort} onChange={(value) => setFilters((current) => ({ ...current, sort: value as typeof filters.sort }))} options={Object.entries(t.sortOptions).map(([value, label]) => ({ value, label }))} />
                </div>
              )}

              {/* Filter Controls Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                {isSimplified && (
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="h-10 rounded-none border border-border bg-surface hover:bg-surface-subtle text-ink text-xs font-bold uppercase tracking-wider px-5 w-full sm:w-auto transition-colors cursor-pointer"
                  >
                    <span className="text-ink font-bold">{showAdvanced ? (rtl ? "إخفاء الخيارات المتقدمة" : "Hide advanced filters") : (rtl ? "خيارات متقدمة" : "Advanced filters")}</span>
                  </button>
                )}

                <div className="flex items-center gap-3 w-full sm:w-auto sm:ms-auto">
                  <button
                    type="submit"
                    className="h-10 px-8 bg-ink text-white hover:bg-brand border border-ink hover:border-brand rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto shadow-sm"
                  >
                    <Search className="size-4 text-white shrink-0" />
                    <span className="text-white font-bold">{t.apply}</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-10 px-6 border border-border bg-surface hover:bg-surface-subtle text-ink rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    <X className="size-4 text-ink shrink-0" />
                    <span className="text-ink font-bold">{t.reset}</span>
                  </button>
                </div>
              </div>
            </form>
          </MagicCard>

          {/* Results Header & Mode Toggle */}
          <section id="results" className="space-y-6" aria-labelledby="results-title">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-brand">
                  {rtl ? "النتائج المتاحة" : "AVAILABLE RESULTS"}
                </p>
                <h2 id="results-title" className="text-2xl font-serif font-light text-ink tracking-tight flex gap-2">
                  <NumberTicker value={initialSearch.total} /> <span>{t.results}</span>
                </h2>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-border bg-surface p-1 rounded-none shadow-sm self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-ink text-white border border-ink"
                      : "bg-surface text-ink hover:bg-surface-subtle border border-transparent"
                  }`}
                >
                  <ListIcon className="size-4 shrink-0" />
                  <span className={viewMode === "list" ? "text-white font-bold" : "text-ink font-bold"}>{rtl ? "قائمة" : "List"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${
                    viewMode === "map"
                      ? "bg-ink text-white border border-ink"
                      : "bg-surface text-ink hover:bg-surface-subtle border border-transparent"
                  }`}
                >
                  <MapIcon className="size-4 shrink-0" />
                  <span className={viewMode === "map" ? "text-white font-bold" : "text-ink font-bold"}>{rtl ? "خريطة" : "Map"}</span>
                </button>
              </div>
            </div>

            {notice && (
              <Alert className="rounded-none border-border bg-surface" variant={notice.kind === "error" ? "destructive" : "default"}>
                <CircleAlert className="size-4" />
                <AlertTitle>{notice.kind === "error" ? t.review : t.saved}</AlertTitle>
                <AlertDescription>{notice.text}</AlertDescription>
              </Alert>
            )}

            {/* Map View */}
            {viewMode === "map" && (
              <div className="border border-border shadow-sm">
                <SearchMap properties={initialSearch.items} locale={locale} />
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <>
                {/* Sponsored Section */}
                {sponsoredItems.length > 0 && (
                  <div className="space-y-4 mb-8" data-testid="sponsored-lane">
                    <div className="flex items-baseline justify-between border-b border-brand/30 pb-2">
                      <h3 className="text-xs font-bold text-brand uppercase tracking-wider">
                        {rtl ? "خيارات ممولة" : "Sponsored Options"}
                      </h3>
                      <span className="text-[10px] text-muted font-mono">
                        {rtl ? "قد تؤثر العمولات على الترتيب" : "Compensation may influence listing visibility"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sponsoredItems.map((item, index) => (
                        <BlurFade key={item.slug} delay={0.05 * index} inView>
                          <PropertyResultCard
                            item={item}
                            locale={locale}
                            text={t}
                            saved={savedSlugs.includes(item.slug)}
                            saving={busySlug === item.slug}
                            compareChecked={compareSlugs.includes(item.slug)}
                            onSave={() => toggleShortlist(item.slug)}
                            onCompare={(checked) => toggleCompare(item.slug, checked)}
                          />
                        </BlurFade>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Organic Grid */}
                {organicItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {organicItems.map((item, index) => (
                      <BlurFade key={item.slug} delay={0.05 * index} inView>
                        <PropertyResultCard
                          item={item}
                          locale={locale}
                          text={t}
                          saved={savedSlugs.includes(item.slug)}
                          saving={busySlug === item.slug}
                          compareChecked={compareSlugs.includes(item.slug)}
                          onSave={() => toggleShortlist(item.slug)}
                          onCompare={(checked) => toggleCompare(item.slug, checked)}
                        />
                      </BlurFade>
                    ))}
                  </div>
                ) : (
                  sponsoredItems.length === 0 && (
                    <div className="border border-border bg-surface p-12 text-center space-y-4">
                      <h3 className="text-2xl font-serif text-ink font-light">{t.noResults}</h3>
                      <p className="text-sm text-text max-w-md mx-auto">{t.noResultsHelp}</p>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="h-10 px-6 bg-ink text-white hover:bg-brand rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <span className="text-white font-bold">{rtl ? "تعديل البحث" : "Adjust your search"}</span>
                      </button>
                    </div>
                  )
                )}
              </>
            )}

            {/* Pagination Controls */}
            {(initialSearch.appliedQuery.cursor || initialSearch.pageInfo.hasNextPage) && (
              <nav className="flex items-center justify-between border-t border-border pt-6 text-xs text-text" aria-label={rtl ? "ترقيم صفحات النتائج" : "Result pages"}>
                <span>
                  {t.showing} {initialSearch.items.length} {t.of} {initialSearch.total}
                </span>
                <div className="flex items-center gap-2">
                  {initialSearch.appliedQuery.cursor && (
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="h-9 px-4 border border-border bg-surface text-ink hover:bg-surface-subtle rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BackIcon className="size-4 text-ink shrink-0" />
                      <span className="text-ink font-bold">{t.previous}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={nextPage}
                    disabled={!initialSearch.pageInfo.hasNextPage}
                    className="h-9 px-4 bg-ink text-white hover:bg-brand disabled:opacity-50 disabled:cursor-not-allowed rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="text-white font-bold">{t.next}</span>
                    <NextIcon className="size-4 text-white shrink-0" />
                  </button>
                </div>
              </nav>
            )}
          </section>

          {/* Floating Compare Tray */}
          {compareSlugs.length > 0 && (
            <aside className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-ink text-white p-4 shadow-2xl border border-white/20 flex items-center gap-6" aria-label={t.compare}>
              <div className="flex items-center gap-2">
                <GitCompareArrows className="size-5 text-brand" />
                <span className="text-xs font-medium text-white">
                  <strong className="font-mono font-bold text-white me-1.5">{compareSlugs.length}/3</strong>
                  {t.compareHint}
                </span>
              </div>
              <button
                type="button"
                onClick={runCompare}
                disabled={compareSlugs.length < 2 || comparing}
                className="h-9 px-5 bg-brand text-white hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span className="text-white font-bold">{comparing ? `${t.compareSelected}…` : t.compareSelected}</span>
              </button>
            </aside>
          )}

          {/* Comparison Drawer */}
          {comparison && (
            <ComparisonView
              id="comparison"
              response={comparison}
              locale={locale}
              text={t}
              showAll={showAll}
              onToggle={() => setShowAll((current) => !current)}
              onClose={() => setComparison(null)}
              BackIcon={BackIcon}
            />
          )}
        </Container>
      </main>

      {/* Dark Architectural Footer */}
      <footer className="bg-[#171717] py-16 text-[#B5B0A8] mt-20 border-t border-[#333]">
        <Container size="full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 items-start">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-none bg-white text-ink font-bold text-sm">
                  R
                </span>
                <span className="font-semibold text-white tracking-widest text-sm">RAMA</span>
              </div>
              <p className="text-xs max-w-sm leading-relaxed text-[#B5B0A8]">
                {rtl
                  ? "كتالوج العقارات الموثقة بدبي — الأدلة والملاءمة والمفاضلات في مكان واحد."
                  : "Verified Dubai property catalogue — evidence, fit, and trade-offs in one place."}
              </p>
              <p className="text-[11px] text-[#777]">
                {rtl
                  ? "لا يحل تحقق راما محل دائرة الأراضي والأملاك أو المشورة القانونية أو التقييم الفعلي."
                  : "RAMA verification does not replace DLD, legal review, valuation or physical inspection."}
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">{rtl ? "الشركة" : "Company"}</h4>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link href={`/${locale}/homes` as any} className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {rtl ? "العقارات" : "Homes"}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/costs` as any} className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {rtl ? "التكاليف" : "Costs"}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/compare` as any} className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {rtl ? "مقارنة" : "Compare"}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider">{rtl ? "قانوني" : "Legal"}</h4>
              <ul className="space-y-3 text-xs">
                <li>
                  <Link href="#" className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {rtl ? "الخصوصية" : "Privacy"}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-[#EAE6E1] hover:text-brand transition-colors">
                    {rtl ? "الشروط" : "Terms"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-6 border-t border-[#333333] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-[#777]">
            <p>© {new Date().getFullYear()} RAMA. {rtl ? "بيانات عقارية موثقة لدبي." : "Verified property data for Dubai."}</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

type Text = typeof copy.en | typeof copy.ar;

function PropertyResultCard({
  item,
  locale,
  text: t,
  saved,
  saving,
  compareChecked,
  onSave,
  onCompare,
}: {
  item: PropertySearchResultItem;
  locale: Locale;
  text: Text;
  saved: boolean;
  saving: boolean;
  compareChecked: boolean;
  onSave: () => void;
  onCompare: (checked: boolean) => void;
}) {
  const verifiedCount = Math.round((item.evidenceCoverage / 100) * 22);
  const rtl = locale === "ar";

  const bgImage = PROPERTY_IMAGE_MAP[item.slug] ?? "/images/property-living-room.jpg";
  const hasDecisionRoom = item.decisionRoomAvailable;

  return (
    <Card className="rounded-none border border-border bg-surface shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden h-full">
      <div>
        {/* Image Header Banner */}
        <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url('${bgImage}')` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 start-3">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-ink text-white border border-white/20">
              {item.tenure === "ready" ? (rtl ? "جاهز للسكن" : "Ready") : (rtl ? "على المخطط" : "Off-plan")}
            </span>
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white">
            <span className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="size-3.5 text-brand" />
              {item.community[locale]}
            </span>
            <span className="text-[11px] font-mono font-bold bg-black/60 backdrop-blur-md px-2 py-0.5 border border-white/20">
              {item.evidenceCoverage}% {rtl ? "موثق" : "Verified"}
            </span>
          </div>
        </div>

        {/* Title & Price Header */}
        <CardHeader className="p-5 pb-2 space-y-1.5">
          <CardTitle>
            <h3 className="text-lg font-serif font-semibold text-ink leading-snug line-clamp-1">{item.name[locale]}</h3>
          </CardTitle>
          <p className="text-2xl font-mono font-bold text-ink">{aed(item.priceAed, locale)}</p>
        </CardHeader>

        {/* Card Specs & Verification Details */}
        <CardContent className="p-5 pt-2 space-y-4">
          {/* Specs Grid */}
          <dl className="bg-surface-subtle p-3 border border-border grid grid-cols-3 text-xs gap-2 text-text font-medium">
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted font-bold">{t.bedroomsLabel}</dt>
              <dd className="font-mono font-bold text-sm text-ink">{item.bedrooms ?? t.unknown}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted font-bold">{t.bathrooms}</dt>
              <dd className="font-mono font-bold text-sm text-ink">{item.bathrooms ?? t.unknown}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted font-bold">{t.area}</dt>
              <dd className="font-mono font-bold text-sm text-ink">
                {item.internalAreaSqFt ? `${new Intl.NumberFormat(locale).format(item.internalAreaSqFt)} ft²` : t.unknown}
              </dd>
            </div>
          </dl>

          {/* High Contrast Emerald Verification Status */}
          <div className="py-2 px-3 bg-[#E8F5E9] border border-[#C8E6C9] text-[#1B5E20] text-xs font-semibold flex items-center gap-2 rounded-none">
            <Check className="size-4 shrink-0 text-[#2E7D32]" aria-hidden="true" />
            <span>
              {rtl ? `تم توثيق ${verifiedCount} من أصل 22 حقيقة أساسية` : `${verifiedCount} of 22 key details verified`}
            </span>
          </div>

          {/* Action Row: Save & Compare */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={`h-10 flex-1 border text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors rounded-none cursor-pointer ${
                saved
                  ? "bg-ink text-white border-ink hover:bg-brand"
                  : "bg-surface text-ink border-border hover:bg-surface-subtle"
              }`}
            >
              <Bookmark className="size-3.5 shrink-0" aria-hidden="true" />
              <span className={saved ? "text-white font-bold" : "text-ink font-bold"}>
                {saving ? t.saving : saved ? t.saved : t.save}
              </span>
            </button>

            <label
              className="h-10 border border-border bg-surface hover:bg-surface-subtle text-ink text-xs font-bold uppercase tracking-wider px-3.5 flex items-center gap-2 cursor-pointer rounded-none transition-colors"
              htmlFor={`compare-${item.slug}`}
            >
              <Checkbox id={`compare-${item.slug}`} checked={compareChecked} onCheckedChange={onCompare} />
              <span className="text-ink font-bold">{t.compare}</span>
            </label>
          </div>
        </CardContent>
      </div>

      {/* Bottom CTA Block */}
      <div className="p-5 pt-0">
        {hasDecisionRoom ? (
          <Link
            href={`/${locale}/homes/${item.slug}` as any}
            className="h-11 w-full bg-ink text-white hover:bg-brand text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-none text-center cursor-pointer shadow-sm"
          >
            <Home className="size-4 shrink-0 text-white" aria-hidden="true" />
            <span className="text-white font-bold">{rtl ? "فتح غرفة القرار" : "Open decision room"} →</span>
          </Link>
        ) : (
          <div className="h-11 w-full bg-surface-subtle border border-border text-muted text-xs font-medium flex items-center justify-center gap-2 rounded-none">
            <LockKeyhole className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
            <span className="text-muted font-medium">{t.unavailableRoom}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[11px] font-bold text-ink uppercase tracking-wider block">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectFilter({
  id,
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span id={`${id}-label`} className="text-[11px] font-bold text-ink uppercase tracking-wider block">
        {label}
      </span>
      <Select value={value} disabled={disabled} onValueChange={(next) => next && onChange(String(next))}>
        <SelectTrigger id={id} aria-labelledby={`${id}-label ${id}`} className="h-10 rounded-none border-border bg-surface text-ink text-sm font-medium focus:border-brand">
          <SelectValue>{options.find((option) => option.value === value)?.label ?? value}</SelectValue>
        </SelectTrigger>
        <SelectContent className="rounded-none border-border bg-surface">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-xs font-medium">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ComparisonView({
  id,
  response,
  locale,
  text: t,
  showAll,
  onToggle,
  onClose,
  BackIcon,
}: {
  id: string;
  response: PropertyCompareResponse;
  locale: Locale;
  text: Text;
  showAll: boolean;
  onToggle: () => void;
  onClose: () => void;
  BackIcon: typeof ArrowLeft;
}) {
  const rows = useMemo(() => comparisonRows(response.items, locale, t), [response.items, locale, t]);
  const visible = showAll ? rows : rows.filter((row) => row.differs || row.unknown);
  return (
    <section className="border border-border bg-surface p-8 shadow-lg space-y-6 mt-12" id={id} aria-labelledby="comparison-title">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold text-brand">RAMA / COMPARE</p>
          <h2 id="comparison-title" className="text-2xl font-serif text-ink font-light">{t.differences}</h2>
          <p className="text-xs text-text">{t.differencesHelp}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-9 px-4 border border-border bg-surface text-ink hover:bg-surface-subtle rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href + "&share=compare");
              alert(locale === "ar" ? "تم نسخ الرابط" : "Share link copied!");
            }}
          >
            <span className="text-ink font-bold">{locale === "ar" ? "مشاركة المقارنة" : "Share Compare"}</span>
          </button>
          <button
            type="button"
            className="h-9 px-4 border border-border bg-surface text-ink hover:bg-surface-subtle rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            onClick={onToggle}
          >
            <span className="text-ink font-bold">{showAll ? t.showDifferences : t.showAll}</span>
          </button>
          <button
            type="button"
            className="h-9 px-4 border border-border bg-surface text-ink hover:bg-surface-subtle rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <BackIcon className="size-4 text-ink shrink-0" />
            <span className="text-ink font-bold">{t.closeCompare}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs border border-border">
          <thead>
            <tr className="bg-surface-subtle border-b border-border text-ink font-bold">
              <th className="p-3 text-start">{t.tradeOffs}</th>
              {response.items.map((item) => (
                <th key={item.slug} className="p-3 text-start font-mono text-sm">{item.name[locale]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.label} className="border-b border-border hover:bg-surface-subtle/50">
                <td className="p-3 font-semibold text-text border-e border-border">{row.label}</td>
                {row.values.map((val, idx) => (
                  <td key={idx} className="p-3 font-mono text-ink">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function comparisonRows(items: PropertySearchResultItem[], locale: Locale, t: Text) {
  const unknown = t.unknown;
  const data: Array<{ label: string; values: string[] }> = [
    { label: t.price, values: items.map((item) => aed(item.priceAed, locale)) },
    { label: t.bedrooms, values: items.map((item) => item.bedrooms?.toString() ?? unknown) },
    { label: t.bathrooms, values: items.map((item) => item.bathrooms?.toString() ?? unknown) },
    { label: t.area, values: items.map((item) => (item.internalAreaSqFt ? `${new Intl.NumberFormat(locale).format(item.internalAreaSqFt)} ft²` : unknown)) },
    { label: t.tenure, values: items.map((item) => (item.tenure === "ready" ? t.ready : t.offPlan)) },
    { label: t.evidenceCoverage, values: items.map((item) => `${item.evidenceCoverage}%`) },
    { label: t.freshness, values: items.map((item) => (item.freshness === "fresh" ? t.fresh : item.freshness === "review" ? t.review : t.stale)) },
  ];
  return data.map((row) => ({ ...row, differs: new Set(row.values).size > 1, unknown: row.values.includes(unknown) }));
}
