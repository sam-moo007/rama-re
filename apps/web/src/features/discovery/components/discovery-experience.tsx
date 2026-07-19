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
  Clock3,
  GitCompareArrows,
  Home,
  LockKeyhole,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { MapIcon, ListIcon } from "lucide-react";

const SearchMap = dynamic(
  () => import("@/features/search/search-map").then((mod) => mod.SearchMap),
  { ssr: false }
);

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

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
    brief: "Household brief",
    title: "Discover homes without filtering unknowns out of sight.",
    intro: "Results use your latest saved brief, then show exactly where evidence matches, needs review, or is unavailable.",
    nonAdvice: "Fit is decision support—not a property-quality score or investment recommendation.",
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
    results: "homes in the current result set",
    briefApplied: "Brief version applied",
    noBrief: "No brief applied",
    synthetic: "Synthetic demo",
    curated: "Curated",
    ready: "Ready",
    offPlan: "Off-plan",
    fresh: "Fresh",
    review: "Review",
    stale: "Stale",
    unknown: "Unknown",
    bedroomsLabel: "bedrooms",
    bathrooms: "bathrooms",
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
    compareHint: "Select 2–4 homes. Unknown values stay visible.",
    compareLimit: "You can compare up to four homes.",
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
    noResults: "No known matches",
    noResultsHelp: "Widen a known filter. RAMA never converts unavailable evidence into a confirmed absence.",
    mobility: "Travel evidence",
    mobilityUnknown: "Route evidence is unavailable for this destination and mode. The home remains visible for review.",
    travelEstimate: "minutes",
    method: "Method",
    source: "Source",
    observed: "Observed",
    routingCaution: "Travel times are evidence-labelled estimates, not guarantees. Present, committed and modelled infrastructure are kept distinct.",
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
    brief: "ملخص الأسرة",
    title: "اكتشف المنازل من دون إخفاء المعلومات المجهولة.",
    intro: "تستخدم النتائج أحدث ملخص محفوظ، ثم توضح أين تتطابق الأدلة أو تحتاج إلى مراجعة أو تكون غير متاحة.",
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
    results: "عقارات في مجموعة النتائج الحالية",
    briefApplied: "إصدار الملخص المستخدم",
    noBrief: "لم يتم تطبيق ملخص",
    synthetic: "نموذج توضيحي",
    curated: "منسق",
    ready: "جاهز",
    offPlan: "على المخطط",
    fresh: "حديث",
    review: "مراجعة",
    stale: "قديم",
    unknown: "غير معروف",
    bedroomsLabel: "غرف نوم",
    bathrooms: "حمامات",
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
    compareHint: "حدد عقارين إلى أربعة. تبقى القيم المجهولة ظاهرة.",
    compareLimit: "يمكنك مقارنة أربعة عقارات كحد أقصى.",
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
    noResults: "لا توجد مطابقات معروفة",
    noResultsHelp: "وسّع أحد عوامل التصفية المعروفة. لا تحوّل راما الدليل غير المتاح إلى غياب مؤكد.",
    mobility: "دليل التنقل",
    mobilityUnknown: "دليل المسار غير متاح لهذه الوجهة ووسيلة التنقل. يبقى العقار ظاهراً للمراجعة.",
    travelEstimate: "دقيقة",
    method: "المنهج",
    source: "المصدر",
    observed: "تاريخ الرصد",
    routingCaution: "أزمنة التنقل تقديرات موصوفة بالأدلة وليست ضمانات. تُفصل البنية القائمة والملتزم بها والنمذجة بوضوح.",
    showing: "عرض",
    of: "من",
    previous: "النتائج السابقة",
    next: "النتائج التالية",
    sortOptions: { fit_desc: "أفضل ملاءمة للملخص", evidence_desc: "اكتمال الأدلة", price_asc: "السعر: من الأقل", price_desc: "السعر: من الأعلى", newest: "أحدث الأدلة" },
  },
} as const;

const aed = (value: number, locale: Locale) => new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(value);

export function DiscoveryExperience({ initialSearch, initialShortlist, locale }: Props) {
  const t = copy[locale];
  const router = useRouter();
  const rtl = locale === "ar";
  const [shortlist, setShortlist] = useState(initialShortlist);
  const [compareSlugs, setCompareSlugs] = useState<string[]>([]);
  const [comparison, setComparison] = useState<PropertyCompareResponse | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
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
    router.push(`/${locale}/discover?${params.toString()}` as Route);
  };

  const resetFilters = () => router.push(`/${locale}/discover` as Route);
  const nextPage = () => { if (!initialSearch.pageInfo.nextCursor) return; const params=new URLSearchParams(window.location.search);params.set("cursor",initialSearch.pageInfo.nextCursor);router.push(`/${locale}/discover?${params.toString()}` as Route); };

  const toggleShortlist = async (slug: string) => {
    setBusySlug(slug);
    setNotice(null);
    const next = savedSlugs.includes(slug) ? savedSlugs.filter((item) => item !== slug) : [...savedSlugs, slug];
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
    if (checked && compareSlugs.length >= 4) {
      setNotice({ kind: "error", text: t.compareLimit });
      return;
    }
    setCompareSlugs((current) => checked ? [...current, slug] : current.filter((item) => item !== slug));
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
    <div className="discoverApp" dir={rtl ? "rtl" : "ltr"} lang={locale}>
      <a className="skipLink" href="#results">{t.skip}</a>
      <header className="discoverHeader"><div className="discoverHeaderInner">
        <a className="brand" href={`/${locale}/discover`}><span className="brandMark" aria-hidden="true">R</span>{t.brand}</a>
        <span className="discoverSecure"><LockKeyhole aria-hidden="true" />{t.secure}</span>
        <nav aria-label={t.secure}>
          <a href={`/${locale}/brief`}>{t.brief}</a>
          <a href={`/${locale}/advisor`}>{locale === "ar" ? "تسليم المستشار" : "Advisor handoff"}</a>
          <a href={`/${locale === "en" ? "ar" : "en"}/discover`} lang={locale === "en" ? "ar" : "en"}>{t.language}</a>
        </nav>
      </div></header>

      <main className="discoverFrame">
        <section className="discoverIntro" aria-labelledby="discover-title">
          <div><p className="eyebrow">RAMA / DISCOVER</p><h1 id="discover-title">{t.title}</h1></div>
          <div><p>{t.intro}</p><span><CircleAlert aria-hidden="true" />{t.nonAdvice}</span></div>
        </section>

        <Card className="discoverFilters"><CardHeader><SlidersHorizontal aria-hidden="true" /><CardTitle>{t.filters}</CardTitle></CardHeader><CardContent>
          <form onSubmit={applyFilters} className="filterGrid">
            <Field id="discover-q" label={t.query}><Input id="discover-q" value={filters.q} onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))} /></Field>
            <SelectFilter id="community-filter" label={t.community} value={filters.community} onChange={(value) => setFilters((current) => ({ ...current, community: value }))} options={[{ value: "all", label: t.anyCommunity }, ...initialSearch.facets.communities.map((facet) => ({ value: facet.value, label: `${facet.label[locale]} (${facet.count})` }))]} />
            <SelectFilter id="destination-filter" label={t.destination} value={filters.destination} onChange={(value) => setFilters((current) => ({ ...current, destination: value, maxTravelMinutes:value==="all"?"":current.maxTravelMinutes, infrastructureState:value==="all"?"all":current.infrastructureState }))} options={[{value:"all",label:t.anyDestination},...initialSearch.facets.destinations.map((facet)=>({value:facet.value,label:`${facet.label[locale]} (${facet.count})`}))]}/>
            <SelectFilter id="travel-mode-filter" label={t.travelMode} value={filters.travelMode} disabled={filters.destination==="all"} onChange={(value)=>setFilters((current)=>({...current,travelMode:value as typeof current.travelMode}))} options={[{value:"drive",label:t.drive},{value:"public_transport",label:t.publicTransport},{value:"walk",label:t.walk}]}/>
            <Field id="max-travel" label={t.maxTravel}><Input id="max-travel" type="number" inputMode="numeric" min={1} max={180} disabled={filters.destination==="all"} value={filters.maxTravelMinutes} onChange={(event)=>setFilters((current)=>({...current,maxTravelMinutes:event.target.value}))}/></Field>
            <SelectFilter id="infrastructure-filter" label={t.infrastructure} value={filters.infrastructureState} disabled={filters.destination==="all"} onChange={(value)=>setFilters((current)=>({...current,infrastructureState:value}))} options={[{value:"all",label:t.anyInfrastructure},{value:"present",label:t.present},{value:"committed",label:t.committed},{value:"modelled",label:t.modelled}]}/>
            <Field id="min-price" label={t.minPrice}><Input id="min-price" type="number" inputMode="numeric" min={0} value={filters.minPriceAed} onChange={(event) => setFilters((current) => ({ ...current, minPriceAed: event.target.value }))} /></Field>
            <Field id="max-price" label={t.maxPrice}><Input id="max-price" type="number" inputMode="numeric" min={1} value={filters.maxPriceAed} onChange={(event) => setFilters((current) => ({ ...current, maxPriceAed: event.target.value }))} /></Field>
            <SelectFilter id="bedroom-filter" label={t.bedrooms} value={filters.minBedrooms} onChange={(value) => setFilters((current) => ({ ...current, minBedrooms: value }))} options={[{ value: "all", label: t.anyBedrooms }, { value: "1", label: "1+" }, { value: "2", label: "2+" }, { value: "3", label: "3+" }]} />
            <SelectFilter id="tenure-filter" label={t.tenure} value={filters.tenure} onChange={(value) => setFilters((current) => ({ ...current, tenure: value }))} options={[{ value: "all", label: t.anyTenure }, { value: "ready", label: t.ready }, { value: "off_plan", label: t.offPlan }]} />
            <SelectFilter id="evidence-filter" label={t.evidence} value={filters.minEvidenceCoverage} onChange={(value) => setFilters((current) => ({ ...current, minEvidenceCoverage: value }))} options={[{ value: "all", label: t.anyEvidence }, { value: "60", label: "60%+" }, { value: "75", label: "75%+" }, { value: "90", label: "90%+" }]} />
            <SelectFilter id="freshness-filter" label={t.freshness} value={filters.freshness} onChange={(value) => setFilters((current) => ({ ...current, freshness: value }))} options={[{ value: "all", label: t.anyFreshness }, { value: "fresh", label: t.fresh }, { value: "review", label: t.review }, { value: "stale", label: t.stale }]} />
            <SelectFilter id="sort-filter" label={t.sort} value={filters.sort} onChange={(value) => setFilters((current) => ({ ...current, sort: value as typeof filters.sort }))} options={Object.entries(t.sortOptions).map(([value, label]) => ({ value, label }))} />
            <div className="filterActions"><Button type="submit" size="lg"><Search data-icon="inline-start" aria-hidden="true" />{t.apply}</Button><Button type="button" size="lg" variant="outline" onClick={resetFilters}><X data-icon="inline-start" aria-hidden="true" />{t.reset}</Button></div>
          </form>
        </CardContent></Card>

        <section id="results" className="discoverResults" aria-labelledby="results-title">
          <style>{`
            .propertyResultCard.sponsoredCard {
              border-color: var(--copper) !important;
              border-width: 1.5px !important;
              background: color-mix(in srgb, var(--accent) 30%, var(--bone)) !important;
            }
            .sponsoredLaneHeader {
              border-bottom: 1px solid var(--line);
              padding-bottom: 8px;
              margin-bottom: 16px;
              display: flex;
              align-items: baseline;
              justify-content: space-between;
            }
          `}</style>
          <div className="resultsHeading">
            <div><p className="eyebrow">RAMA / MATCH SET</p><h2 id="results-title">{initialSearch.total} {t.results}</h2></div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2 border rounded p-1 bg-background">
                <Button 
                  variant={viewMode === "list" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode("list")}
                  className="h-8 text-xs px-3"
                >
                  <ListIcon className="w-4 h-4 mr-2" />
                  List
                </Button>
                <Button 
                  variant={viewMode === "map" ? "secondary" : "ghost"} 
                  size="sm" 
                  onClick={() => setViewMode("map")}
                  className="h-8 text-xs px-3"
                >
                  <MapIcon className="w-4 h-4 mr-2" />
                  Map
                </Button>
              </div>
              <div className="hidden sm:flex gap-2 items-center">
                <Badge variant="outline">{initialSearch.briefVersionApplied ? `${t.briefApplied}: ${initialSearch.briefVersionApplied}` : t.noBrief}</Badge>
                <span className="text-sm text-muted-foreground">{initialSearch.searchVersion}</span>
              </div>
            </div>
          </div>
          {notice && <Alert className="discoverNotice" variant={notice.kind === "error" ? "destructive" : "default"}><CircleAlert aria-hidden="true" /><AlertTitle>{notice.kind === "error" ? t.review : t.saved}</AlertTitle><AlertDescription>{notice.text}</AlertDescription></Alert>}
          
          {viewMode === "map" && (
            <div className="mb-8">
              <SearchMap properties={initialSearch.items} locale={locale} />
            </div>
          )}

          {viewMode === "list" && (
            <>
              {/* Sponsored Lane */}
              {sponsoredItems.length > 0 && (
                <div className="mb-8" data-testid="sponsored-lane">
                  <div className="sponsoredLaneHeader">
                    <h3 className="text-xs font-bold text-copper uppercase tracking-wider">
                      {locale === "ar" ? "خيارات ممولة" : "Sponsored Options"}
                    </h3>
                    <span className="text-[10px] text-ink-muted">
                      {locale === "ar" 
                        ? "قد تؤثر العمولات على ترتيب هذه العقارات" 
                        : "Compensation may influence listing visibility"}
                    </span>
                  </div>
                  <div className="propertyResultGrid">
                    {sponsoredItems.map((item) => (
                      <PropertyResultCard key={item.slug} item={item} locale={locale} text={t} briefApplied={initialSearch.briefVersionApplied !== null} mobilityRequested={Boolean(initialSearch.appliedQuery.destination)} saved={savedSlugs.includes(item.slug)} saving={busySlug === item.slug} compareChecked={compareSlugs.includes(item.slug)} onSave={() => toggleShortlist(item.slug)} onCompare={(checked) => toggleCompare(item.slug, checked)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Organic Lane */}
              {organicItems.length > 0 ? (
                <div className="propertyResultGrid">
                  {organicItems.map((item) => (
                    <PropertyResultCard key={item.slug} item={item} locale={locale} text={t} briefApplied={initialSearch.briefVersionApplied !== null} mobilityRequested={Boolean(initialSearch.appliedQuery.destination)} saved={savedSlugs.includes(item.slug)} saving={busySlug === item.slug} compareChecked={compareSlugs.includes(item.slug)} onSave={() => toggleShortlist(item.slug)} onCompare={(checked) => toggleCompare(item.slug, checked)} />
                  ))}
                </div>
              ) : (
                sponsoredItems.length === 0 && <Alert className="emptyResults"><Search aria-hidden="true" /><AlertTitle>{t.noResults}</AlertTitle><AlertDescription>{t.noResultsHelp}</AlertDescription></Alert>
              )}
            </>
          )}

          {(initialSearch.appliedQuery.cursor||initialSearch.pageInfo.hasNextPage)&&<nav className="resultPagination" aria-label={locale==="ar"?"ترقيم صفحات النتائج":"Result pages"}><span>{t.showing} {initialSearch.items.length} {t.of} {initialSearch.total}</span><div>{initialSearch.appliedQuery.cursor&&<Button variant="outline" onClick={()=>router.back()}><BackIcon data-icon="inline-start" aria-hidden="true"/>{t.previous}</Button>}<Button onClick={nextPage} disabled={!initialSearch.pageInfo.hasNextPage}>{t.next}<NextIcon data-icon="inline-end" aria-hidden="true"/></Button></div></nav>}
        </section>

        {compareSlugs.length > 0 && <aside className="compareTray" aria-label={t.compare}><div><GitCompareArrows aria-hidden="true" /><span><strong>{compareSlugs.length}/4</strong>{t.compareHint}</span></div><Button size="lg" onClick={runCompare} disabled={compareSlugs.length < 2 || comparing}>{comparing ? `${t.compareSelected}…` : t.compareSelected}</Button></aside>}

        {comparison && <ComparisonView id="comparison" response={comparison} locale={locale} text={t} showAll={showAll} onToggle={() => setShowAll((current) => !current)} onClose={() => setComparison(null)} BackIcon={BackIcon} />}
      </main>
    </div>
  );
}

type Text = typeof copy.en | typeof copy.ar;

function PropertyResultCard({ item, locale, text: t, briefApplied, mobilityRequested, saved, saving, compareChecked, onSave, onCompare }: { item: PropertySearchResultItem; locale: Locale; text: Text; briefApplied: boolean; mobilityRequested:boolean; saved: boolean; saving: boolean; compareChecked: boolean; onSave: () => void; onCompare: (checked: boolean) => void }) {
  return <Card className={`propertyResultCard ${item.sponsored ? "sponsoredCard" : ""}`}><div className={`resultMedia media-${item.mediaRepresentation}`}><span>{item.mediaRepresentation.replaceAll("_", " ")}</span></div><CardHeader><div className="resultBadges"><Badge variant={item.recordKind === "curated" ? "secondary" : "outline"}>{item.recordKind === "curated" ? t.curated : t.synthetic}</Badge>{item.sponsored && <Badge className="bg-copper text-white hover:bg-copper-dark border-none">{locale === "ar" ? "إعلان ممول" : "Sponsored"}</Badge>}<Badge variant={item.freshness === "stale" ? "destructive" : "outline"}>{item.freshness === "fresh" ? t.fresh : item.freshness === "review" ? t.review : t.stale}</Badge></div><CardTitle><h3>{item.name[locale]}</h3></CardTitle><CardDescription>{item.community[locale]}</CardDescription></CardHeader><CardContent>
    <p className="resultPrice">{aed(item.priceAed, locale)}</p>
    <dl className="resultFacts"><div><dt>{t.bedroomsLabel}</dt><dd>{item.bedrooms ?? t.unknown}</dd></div><div><dt>{t.bathrooms}</dt><dd>{item.bathrooms ?? t.unknown}</dd></div><div><dt>{t.area}</dt><dd>{item.internalAreaSqFt ? `${new Intl.NumberFormat(locale).format(item.internalAreaSqFt)} ft²` : t.unknown}</dd></div><div><dt>{t.tenure}</dt><dd>{item.tenure === "ready" ? t.ready : t.offPlan}</dd></div></dl>
    {mobilityRequested&&(item.selectedMobility?<section className="resultMobility"><header><Clock3 aria-hidden="true"/><strong>{t.mobility}</strong><Badge variant={item.selectedMobility.infrastructureState==="present"?"secondary":"outline"}>{t[item.selectedMobility.infrastructureState]}</Badge></header><p className="mobilityDuration">{item.selectedMobility.durationMinutes??t.unknown}{item.selectedMobility.durationMinutes!==null&&` ${t.travelEstimate}`}</p><dl><div><dt>{t.method}</dt><dd>{item.selectedMobility.methodLabel[locale]} · {item.selectedMobility.methodVersion}</dd></div><div><dt>{t.source}</dt><dd>{item.selectedMobility.sourceLabel[locale]}</dd></div><div><dt>{t.observed}</dt><dd>{new Intl.DateTimeFormat(locale==="ar"?"ar-AE":"en-AE",{dateStyle:"medium"}).format(new Date(item.selectedMobility.observedAt))}</dd></div></dl><small><MapPin aria-hidden="true"/>{t.routingCaution}</small></section>:<Alert className="mobilityUnknown"><MapPin aria-hidden="true"/><AlertTitle>{t.mobility}</AlertTitle><AlertDescription>{t.mobilityUnknown}</AlertDescription></Alert>)}
    <div className="resultCoverage"><span>{t.evidenceCoverage}<strong>{item.evidenceCoverage}%</strong></span><Progress value={item.evidenceCoverage} aria-label={`${t.evidenceCoverage}: ${item.evidenceCoverage}%`} /></div>
    <div className="fitSignals"><div className="fitScore"><span>{briefApplied ? t.fit : t.evidenceRank}</span><strong>{item.fitScore}/100</strong></div>{item.fitSignals.slice(0,4).map((signal) => <div className={`fitSignal signal-${signal.outcome}`} key={signal.key}><span>{signal.outcome === "match" ? <Check aria-hidden="true" /> : <CircleAlert aria-hidden="true" />}{signal.label[locale]}</span><small>{signal.category.replaceAll("_", " ")}</small><p>{signal.explanation[locale]}</p></div>)}<details><summary>{t.fitExplanation}</summary><p>{item.rankingExplanation[locale]}</p></details></div>
    {item.missingCriticalEvidence.length > 0 && <Alert className="missingEvidence"><CircleAlert aria-hidden="true" /><AlertTitle>{t.missing}</AlertTitle><AlertDescription><ul>{item.missingCriticalEvidence.map((missing) => <li key={missing.en}>{missing[locale]}</li>)}</ul></AlertDescription></Alert>}
    <div className="resultActions"><Button variant={saved ? "secondary" : "outline"} size="lg" onClick={onSave} disabled={saving}><Bookmark data-icon="inline-start" aria-hidden="true" />{saving ? t.saving : saved ? t.saved : t.save}</Button><label className="compareChoice" htmlFor={`compare-${item.slug}`}><Checkbox id={`compare-${item.slug}`} checked={compareChecked} onCheckedChange={onCompare} /><span>{t.compare}</span></label></div>
    {item.decisionRoomAvailable ? <a className="decisionRoomLink" href={`/${locale}/properties/${item.slug}`}><Home aria-hidden="true" />{t.decisionRoom}</a> : <span className="decisionRoomUnavailable"><LockKeyhole aria-hidden="true" />{t.unavailableRoom}</span>}
  </CardContent></Card>;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return <div className="filterField"><label htmlFor={id}>{label}</label>{children}</div>;
}

function SelectFilter({ id, label, value, onChange, options, disabled=false }: { id: string; label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>;disabled?:boolean }) {
  return <div className="filterField"><span id={`${id}-label`}>{label}</span><Select value={value} disabled={disabled} onValueChange={(next) => next && onChange(String(next))}><SelectTrigger id={id} aria-labelledby={`${id}-label ${id}`}><SelectValue>{options.find((option) => option.value === value)?.label ?? value}</SelectValue></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div>;
}

function ComparisonView({ id, response, locale, text: t, showAll, onToggle, onClose, BackIcon }: { id: string; response: PropertyCompareResponse; locale: Locale; text: Text; showAll: boolean; onToggle: () => void; onClose: () => void; BackIcon: typeof ArrowLeft }) {
  const rows = useMemo(() => comparisonRows(response.items, locale, t), [response.items, locale, t]);
  const visible = showAll ? rows : rows.filter((row) => row.differs || row.unknown);
  return <section className="comparisonSection" id={id} aria-labelledby="comparison-title">
    <div className="comparisonHeading">
      <div><p className="eyebrow">RAMA / COMPARE</p><h2 id="comparison-title">{t.differences}</h2><p>{t.differencesHelp}</p></div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => {
          navigator.clipboard.writeText(window.location.href + "&share=compare");
          alert(locale === "ar" ? "تم نسخ الرابط" : "Share link copied!");
        }}>
          {locale === "ar" ? "مشاركة المقارنة" : "Share Compare"}
        </Button>
        <Button variant="outline" onClick={onToggle}>{showAll ? t.showDifferences : t.showAll}</Button>
        <Button variant="ghost" onClick={onClose}><BackIcon data-icon="inline-start" aria-hidden="true" />{t.closeCompare}</Button>
      </div>
    </div>
    
    <div className="comparisonTable" role="table" aria-label={t.differences} style={{ "--compare-columns": response.items.length } as React.CSSProperties}>
      <div className="comparisonRow comparisonNames" role="row"><span role="columnheader" />{response.items.map((item) => <strong role="columnheader" key={item.slug}>{item.name[locale]}</strong>)}</div>
      {visible.map((row) => <div className={`comparisonRow${row.unknown ? " comparisonUnknown" : ""}`} role="row" key={row.label}><strong role="rowheader">{row.label}</strong>{row.values.map((value, index) => <span role="cell" key={`${row.label}-${response.items[index]?.slug}`}>{value}</span>)}</div>)}
    </div>
    
    <div className="mt-8 border-t pt-8">
      <h3 className="font-semibold text-lg mb-4">{locale === "ar" ? "تعليقات المقارنة" : "Compare Room Comments"}</h3>
      <div className="bg-slate-50 p-4 rounded border flex flex-col gap-4">
        <div className="flex gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">P</div>
          <div>
            <div className="font-semibold">Partner Agent <span className="text-xs text-slate-500 font-normal ml-2">2h ago</span></div>
            <div className="mt-1 text-slate-700">Both properties have strong evidence coverage, but the second one has better transport links.</div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <input type="text" placeholder={locale === "ar" ? "إضافة تعليق..." : "Add a comment..."} className="flex-1 border rounded px-3 py-2 text-sm" />
          <Button variant="secondary" size="sm">{locale === "ar" ? "إرسال" : "Send"}</Button>
        </div>
      </div>
    </div>
  </section>;
}

function comparisonRows(items: PropertySearchResultItem[], locale: Locale, t: Text) {
  const unknown = t.unknown;
  const data: Array<{ label: string; values: string[] }> = [
    { label: t.price, values: items.map((item) => aed(item.priceAed, locale)) },
    { label: t.bedrooms, values: items.map((item) => item.bedrooms?.toString() ?? unknown) },
    { label: t.bathrooms, values: items.map((item) => item.bathrooms?.toString() ?? unknown) },
    { label: t.area, values: items.map((item) => item.internalAreaSqFt ? `${new Intl.NumberFormat(locale).format(item.internalAreaSqFt)} ft²` : unknown) },
    { label: t.tenure, values: items.map((item) => item.tenure === "ready" ? t.ready : t.offPlan) },
    { label: t.evidenceCoverage, values: items.map((item) => `${item.evidenceCoverage}%`) },
    { label: t.freshness, values: items.map((item) => item.freshness === "fresh" ? t.fresh : item.freshness === "review" ? t.review : t.stale) },
    { label: t.access, values: items.map((item) => item.stepFreeAccess === "unknown" ? unknown : item.stepFreeAccess === "verified" ? t.curated : t.review) },
    { label: t.representation, values: items.map((item) => item.mediaRepresentation.replaceAll("_", " ")) },
    { label: t.missingCount, values: items.map((item) => item.missingCriticalEvidence.length.toString()) },
  ];
  return data.map((row) => ({ ...row, differs: new Set(row.values).size > 1, unknown: row.values.includes(unknown) }));
}
