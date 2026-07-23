import dynamic from "next/dynamic";
import { localize, type Locale } from "@/lib/i18n";
import type { PropertyDecisionRoom } from "@rama/contracts";
import TextReveal from "@/components/pixel-perfect/text-reveal";
import { MapPinned, Landmark, CalendarDays } from "lucide-react";

const CommuteWidget = dynamic(
  () => import("../commute-widget").then((mod) => mod.CommuteWidget),
  { loading: () => <div className="h-64 rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Commute Data...</div> }
);

const CommunityAtlas = dynamic(
  () => import("../community-atlas").then((mod) => mod.CommunityAtlas),
  { loading: () => <div className="h-[400px] rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Community Atlas...</div> }
);

const DistrictMap3D = dynamic(
  () => import("../district-map-3d").then((mod) => mod.DistrictMap3D),
  { loading: () => <div className="h-[450px] rounded-md animate-pulse bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">Initializing 3D Environment...</div> }
);

export function WhereSection({
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
    <section id="where" aria-labelledby="where-heading">
      <div className="space-y-3 mb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-brand">RAMA / 03</p>
        <h2 id="where-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-light">
          <TextReveal>{sectionTitle}</TextReveal>
        </h2>
        <p className="text-sm text-text leading-relaxed max-w-xl">
          {isAr ? "نفصل بين ما هو قائم اليوم وما هو ملتزم به وما هو مجرد سيناريو." : "Today, committed infrastructure and scenarios stay separate."}
        </p>
      </div>

      <CommuteWidget />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-6">
        <article className="border border-border bg-surface p-6 space-y-3">
          <div className="flex items-center gap-2">
            <MapPinned className="size-5 text-brand" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
              {isAr ? "اليوم" : "Today"}
            </span>
          </div>
          <h3 className="text-base font-semibold text-ink">{localize(property.community, locale)}</h3>
          <p className="text-xs text-text leading-relaxed">
            {isAr ? "المتاجر ومسار الواجهة المائية ومحطة المركبات مقاسة من مدخل المبنى." : "Retail, waterfront route and vehicle pickup measured from the building entrance."}
          </p>
        </article>

        <article className="border border-border bg-surface p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Landmark className="size-5 text-brand" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-text">
              {isAr ? "سياق المبنى" : "Building context"}
            </span>
          </div>
          <h3 className="text-base font-semibold text-ink">{isAr ? "المدخل → المصعد → العتبة" : "Entrance → lift → threshold"}</h3>
          <p className="text-xs text-text leading-relaxed">
            {isAr ? "تم تسجيل المسار كاملاً، وليس فقط وسم عام لإمكانية الوصول." : "The complete route is recorded, not a generic accessibility tag."}
          </p>
        </article>

        <article className="border border-border bg-surface p-6 space-y-3 md:col-span-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-5 text-brand" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-text">
              {isAr ? "البنية الملتزم بها" : "Committed infrastructure"}
            </span>
          </div>
          <h3 className="text-base font-semibold text-ink">{isAr ? "لا تُعامل كخدمة حالية" : "Not treated as current service"}</h3>
          <p className="text-xs text-text leading-relaxed">
            {isAr ? "أي تحديث مستقبلي للنقل سيعرض مصدره وتاريخه وحالته بوضوح." : "Any future transport update will show its source, date and status explicitly."}
          </p>
        </article>
      </div>

      <div className="flex flex-col gap-8">
        <CommunityAtlas locale={locale} />
        <DistrictMap3D locale={locale} />
      </div>
    </section>
  );
}
// cache bust
