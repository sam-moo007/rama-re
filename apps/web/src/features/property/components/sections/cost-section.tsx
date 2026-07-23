import { localize, type Locale } from "@/lib/i18n";
import type { PropertyDecisionRoom, CostLine } from "@rama/contracts";
import TextReveal from "@/components/pixel-perfect/text-reveal";
import Border1 from "@/components/pixel-perfect/border1";
import { formatAed, formatDate } from "@/lib/format";
import { CostScenarioLab } from "../cost-scenario-lab";
import { ComparableTransactions } from "../comparable-transactions";
import { DldTransactionTable } from "../dld-transaction-table";

const timingOrder: CostLine["timing"][] = ["reservation", "transaction", "ownership", "exit"];

const timingLabels = {
  en: { reservation: "At reservation", transaction: "At transaction", ownership: "During ownership", exit: "At exit" },
  ar: { reservation: "عند الحجز", transaction: "عند المعاملة", ownership: "أثناء الملكية", exit: "عند الخروج" },
} as const;

export function CostSection({
  locale,
  property,
  sectionTitle,
  costTitle,
  costIntro,
}: {
  locale: Locale;
  property: PropertyDecisionRoom;
  sectionTitle: string;
  costTitle: string;
  costIntro: string;
}) {
  return (
    <section id="cost" aria-labelledby="cost-heading">
      <div className="space-y-3 mb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-brand">RAMA / 02</p>
        <h2 id="cost-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-light">
          <TextReveal>{sectionTitle}</TextReveal>
        </h2>
        <div className="space-y-1">
          <strong className="text-sm text-ink">{costTitle}</strong>
          <p className="text-sm text-text leading-relaxed">{costIntro}</p>
        </div>
      </div>

      {/* Cost Waterfall */}
      <div className="space-y-6 mb-8">
        {timingOrder.map((timing, index) => {
          const lines = property.costs.filter((line) => line.timing === timing);
          return (
            <article className="relative border border-border bg-surface p-6 space-y-4 group hover:border-brand/40 transition-colors" key={timing}>
              <Border1 />
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <span className="text-xs font-mono font-bold text-brand">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="text-base font-semibold text-ink">{timingLabels[locale][timing]}</h3>
              </div>
              <div className="space-y-3">
                {lines.map((line) => (
                  <div className="flex items-start justify-between gap-4 text-sm" key={line.id}>
                    <div className="space-y-0.5">
                      <strong className="text-text font-medium">{localize(line.label, locale)}</strong>
                      <p className="text-xs text-muted">{localize(line.source, locale)} · {formatDate(line.effectiveAt, locale)}</p>
                    </div>
                    <span className="font-mono font-bold text-ink shrink-0 tabular-nums">
                      {line.amountAed !== null ? formatAed(line.amountAed, locale) : line.amountRangeAed ? `${formatAed(line.amountRangeAed[0], locale)}–${formatAed(line.amountRangeAed[1], locale)}` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mb-8">
        <CostScenarioLab locale={locale} priceAed={property.priceAed} annualServiceChargeAed={property.costs.find(c => c.id === "ownership")?.amountAed ?? 21312} />
      </div>
      <ComparableTransactions
        locale={locale}
        basePrice={property.priceAed}
        baseArea={Number(property.facts.find(f => f.label.en === "Area")?.value.en.replace(/[^\d.]/g, '') || 2000)}
      />
      <DldTransactionTable locale={locale} transactions={property.dldTransactions} />
    </section>
  );
}
