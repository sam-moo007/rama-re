import { localize, type Locale } from "@/lib/i18n";
import type { PropertyDecisionRoom } from "@rama/contracts";
import TextReveal from "@/components/pixel-perfect/text-reveal";
import Border1 from "@/components/pixel-perfect/border1";
import { Check, CircleAlert, FileQuestion, Route, SunMedium, WalletCards } from "lucide-react";

export function FitSection({
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
    <section id="fit" aria-labelledby="fit-heading">
      <div className="space-y-3 mb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-brand">RAMA / 05</p>
        <h2 id="fit-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-light">
          <TextReveal>{sectionTitle}</TextReveal>
        </h2>
        <p className="text-sm text-text leading-relaxed max-w-xl">
          {isAr ? "ملاءمة مبنية على القيود التي اخترتها." : "Fit is based on the constraints you chose."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {property.fitReasons.map((reason, index) => {
          const icons = [WalletCards, Route, SunMedium];
          const Icon = icons[index] ?? Check;
          return (
            <div className="relative border border-border bg-surface p-6 space-y-3 group hover:border-brand/40 transition-colors" key={reason.en} role="article">
              <Border1 />
              <Icon aria-hidden="true" className="size-5 text-brand" strokeWidth={1.5} />
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted">
                {isAr ? `سبب ${index + 1}` : `Fit reason ${String(index + 1).padStart(2, "0")}`}
              </p>
              <h3 className="text-base font-semibold text-ink">{localize(reason, locale)}</h3>
              <p className="text-xs text-text leading-relaxed">
                {index === 0 ? (isAr ? "محسوب من سيناريو السيولة المحفوظ." : "Calculated from the saved cash scenario.") : index === 1 ? (isAr ? "تم قياس المسار في الموقع." : "Route observed and measured on site.") : (isAr ? "الاتجاه مقاس من مخطط الوحدة." : "Orientation measured from the unit plan.")}
              </p>
            </div>
          );
        })}
      </div>

      {/* Risks */}
      <div className="space-y-4">
        {property.risks.map((risk) => (
          <article className="relative border border-border bg-surface p-5 group hover:border-brand/40 transition-colors" key={risk.id}>
            <Border1 />
            <div className="flex items-start gap-4 mb-4">
              <span className={`flex size-8 items-center justify-center shrink-0 ${risk.status === "unknown" ? "bg-[var(--unknown-tint,#f4f6f7)] text-[var(--unknown,#8e9598)]" : "bg-[var(--risk-tint,#fcf5f3)] text-[var(--risk,#c47c6f)]"}`}>
                {risk.status === "unknown" ? <FileQuestion aria-hidden="true" className="size-4" /> : <CircleAlert aria-hidden="true" className="size-4" />}
              </span>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted">
                  {risk.status === "unknown" ? (isAr ? "غير معروف" : "Unknown") : (isAr ? "يحتاج مراجعة" : "Review")}
                </span>
                <h3 className="text-base font-semibold text-ink">{localize(risk.issue, locale)}</h3>
              </div>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-t border-border pt-4">
              <div>
                <dt className="font-semibold text-text">{isAr ? "الأثر" : "Impact"}</dt>
                <dd className="text-text mt-0.5">{localize(risk.impact, locale)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-text">{isAr ? "المصدر" : "Source"}</dt>
                <dd className="text-text mt-0.5">{localize(risk.source, locale)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-text">{isAr ? "خطوة التحقق التالية" : "Next verification step"}</dt>
                <dd className="text-text mt-0.5">{localize(risk.nextStep, locale)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
