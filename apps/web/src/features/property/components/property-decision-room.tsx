import type { CostLine, PropertyDecisionRoom } from "@rama/contracts";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleAlert,
  FileQuestion,
  Landmark,
  MapPinned,
  MessageSquareText,
  Route,
  ShieldCheck,
  SunMedium,
  WalletCards,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatAed, formatDate } from "@/lib/format";
import { copy, localize, type Locale } from "@/lib/i18n";

import { CostScenarioLab } from "./cost-scenario-lab";
import { PropertyHero } from "./property-hero";
import { SiteHeader } from "./site-header";
import { TourExperience } from "./tour-experience";
import { TrustPassport } from "./trust-passport";
import { DldTransactionTable } from "./dld-transaction-table";
import { CommuteWidget } from "./commute-widget";
import { DecisionComments } from "./decision-comments";
import { OffPlanChronology } from "./off-plan-chronology";
import { ComparableTransactions } from "./comparable-transactions";
import { GuidedLiveTour } from "./guided-live-tour";
import { DocumentVault } from "./document-vault";
import { CommunityAtlas } from "./community-atlas";
import { DistrictMap3D } from "./district-map-3d";
import { AiAdvisorChat } from "@/features/advisor/components/ai-advisor-chat";

type PropertyDecisionRoomProps = {
  locale: Locale;
  property: PropertyDecisionRoom;
};

const timingOrder: CostLine["timing"][] = ["reservation", "transaction", "ownership", "exit"];

const timingLabels = {
  en: { reservation: "At reservation", transaction: "At transaction", ownership: "During ownership", exit: "At exit" },
  ar: { reservation: "عند الحجز", transaction: "عند المعاملة", ownership: "أثناء الملكية", exit: "عند الخروج" },
} as const;

const basisLabels = {
  en: { measured: "Measured", source_provided: "Source-provided", modelled: "Modelled", unknown: "Unknown" },
  ar: { measured: "مقاس", source_provided: "من المصدر", modelled: "محسوب", unknown: "غير معروف" },
} as const;

export function PropertyDecisionRoomView({ locale, property }: PropertyDecisionRoomProps) {
  const text = copy[locale];

  return (
    <div className="appShell" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <a className="skipLink" href="#main-content">{locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}</a>
      <SiteHeader locale={locale} slug={property.slug} />

      <main id="main-content">
        <div className="pageFrame">
          <nav className="breadcrumbs" aria-label={locale === "ar" ? "مسار الصفحة" : "Breadcrumb"}>
            <a href="#fit">{locale === "ar" ? "شراء" : "Buy"}</a><span>/</span>
            <a href="#area">{localize(property.community, locale)}</a><span>/</span>
            <span aria-current="page">{localize(property.name, locale)}</span>
          </nav>

          <PropertyHero locale={locale} property={property} />

          <div className="decisionLayout">
            <aside className="sectionRail">
              <p className="eyebrow">{locale === "ar" ? "سجل القرار" : "Decision record"}</p>
              <nav aria-label={locale === "ar" ? "أقسام العقار" : "Property sections"}>
                {text.sections.map(([id, label], index) => (
                  <a href={`#${id}`} key={id}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>
                ))}
              </nav>
              <div className="railStatus"><ShieldCheck aria-hidden="true" size={18} /><span><strong>{property.evidenceCoverage}%</strong>{text.evidenceComplete}</span></div>
            </aside>

            <div className="decisionContent">
              <section className="contentSection" id="fit" aria-labelledby="fit-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / 01</p><h2 id="fit-heading">{text.sections[0][1]}</h2></div>
                  <p>{locale === "ar" ? "ملاءمة مبنية على القيود التي اخترتها، وليست توصية استثمارية." : "Fit is based on the constraints you chose, not an investment recommendation."}</p>
                </div>
                <div className="fitGrid">
                  {property.fitReasons.map((reason, index) => {
                    const icons = [WalletCards, Route, SunMedium];
                    const Icon = icons[index] ?? Check;
                    return (
                      <Card className="fitCard" key={reason.en} role="article">
                        <Icon aria-hidden="true" size={21} strokeWidth={1.5} />
                        <span>{locale === "ar" ? `سبب ${index + 1}` : `Fit reason ${String(index + 1).padStart(2, "0")}`}</span>
                        <h3>{localize(reason, locale)}</h3>
                        <p>{index === 0 ? (locale === "ar" ? "محسوب من سيناريو السيولة المحفوظ." : "Calculated from the saved cash scenario.") : index === 1 ? (locale === "ar" ? "تم قياس المسار في الموقع." : "Route observed and measured on site.") : (locale === "ar" ? "الاتجاه مقاس من مخطط الوحدة." : "Orientation measured from the unit plan.")}</p>
                      </Card>
                    );
                  })}
                </div>
                <div className="fitUnknown"><CircleAlert aria-hidden="true" size={20} /><div><strong>{text.uncertain}</strong><p>{localize(property.uncertainConstraint, locale)}</p></div><a href="#risks">{locale === "ar" ? "عرض الخطوة التالية" : "See next step"}<ArrowUpRight aria-hidden="true" size={16} /></a></div>
              </section>

              <section className="contentSection" id="passport" aria-labelledby="passport-heading">
                <h2 className="srOnly" id="passport-heading">{text.sections[1][1]}</h2>
                <TrustPassport claims={property.claims} coverage={property.evidenceCoverage} locale={locale} />
              </section>

              <section className="contentSection" id="facts" aria-labelledby="facts-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / 03</p><h2 id="facts-heading">{text.sections[2][1]}</h2></div>
                  <p>{locale === "ar" ? "كل حقيقة توضّح أساسها؛ المقاس يختلف عن المعلومة المقدمة من المصدر." : "Every fact shows its basis; measured is different from source-provided."}</p>
                </div>
                <dl className="factGrid">
                  {property.facts.map((fact) => (
                    <div key={fact.label.en}><dt>{localize(fact.label, locale)}<span>{basisLabels[locale][fact.basis]}</span></dt><dd>{localize(fact.value, locale)}</dd></div>
                  ))}
                </dl>
                
                <ComparableTransactions 
                  locale={locale} 
                  basePrice={property.priceAed} 
                  baseArea={Number(property.facts.find(f => f.label.en === "Area")?.value.en.replace(/[^\d.]/g, '') || 2000)} 
                />
              </section>

              <section className="contentSection" id="tour" aria-labelledby="tour-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / 04</p><h2 id="tour-heading">{text.sections[3][1]}</h2></div>
                  <p>{locale === "ar" ? "تجربة لفهم المكان، مع بديل كامل لا يحتاج إلى عرض بانورامي." : "A tour for understanding, with a complete non-panorama alternative."}</p>
                </div>
                {/* Fallback to Guided Tour if requested, otherwise normal Tour */}
                <div className="mb-8">
                  <GuidedLiveTour locale={locale} />
                </div>
                <TourExperience locale={locale} tour={property.tour} />
              </section>

              {/* Secure Document Vault & Off-Plan Chronology */}
              <section className="contentSection" id="documents" aria-labelledby="documents-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / DOCUMENTS</p><h2 id="documents-heading">{locale === "ar" ? "المستندات والتسلسل الزمني" : "Documents & Chronology"}</h2></div>
                </div>
                <div className="flex flex-col gap-8">
                  <OffPlanChronology locale={locale} />
                  <DocumentVault locale={locale} />
                </div>
              </section>

              <section className="contentSection" id="costs" aria-labelledby="costs-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / 05</p><h2 id="costs-heading">{text.sections[4][1]}</h2></div>
                  <div><strong>{text.costTitle}</strong><p>{text.costIntro}</p></div>
                </div>
                <div className="costWaterfall">
                  {timingOrder.map((timing, index) => {
                    const lines = property.costs.filter((line) => line.timing === timing);
                    return (
                      <article className="costStage" key={timing}>
                        <span className="stageNumber">{String(index + 1).padStart(2, "0")}</span>
                        <h3>{timingLabels[locale][timing]}</h3>
                        {lines.map((line) => (
                          <div className="costLine" key={line.id}>
                            <strong>{localize(line.label, locale)}</strong>
                            <span>{line.amountAed !== null ? formatAed(line.amountAed, locale) : line.amountRangeAed ? `${formatAed(line.amountRangeAed[0], locale)}–${formatAed(line.amountRangeAed[1], locale)}` : "—"}</span>
                            <small>{localize(line.source, locale)} · {formatDate(line.effectiveAt, locale)}</small>
                          </div>
                        ))}
                      </article>
                    );
                  })}
                </div>
                <CostScenarioLab locale={locale} priceAed={property.priceAed} annualServiceChargeAed={property.costs.find(c => c.id === "ownership")?.amountAed ?? 21312} />
              </section>

              <section className="contentSection" id="area" aria-labelledby="area-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / 06</p><h2 id="area-heading">{text.sections[5][1]}</h2></div>
                  <p>{locale === "ar" ? "نفصل بين ما هو قائم اليوم وما هو ملتزم به وما هو مجرد سيناريو." : "Today, committed infrastructure and scenarios stay separate."}</p>
                </div>
                <CommuteWidget />
                <div className="areaGrid">
                  <article className="areaMap">
                    <div className="mapGrid" aria-hidden="true"><span className="water" /><span className="road roadOne" /><span className="road roadTwo" /><span className="mapPin"><MapPinned size={19} /></span></div>
                    <div><span className="stateTag verified">{locale === "ar" ? "اليوم" : "Today"}</span><h3>{localize(property.community, locale)}</h3><p>{locale === "ar" ? "المتاجر ومسار الواجهة المائية ومحطة المركبات مقاسة من مدخل المبنى." : "Retail, waterfront route and vehicle pickup measured from the building entrance."}</p></div>
                  </article>
                  <article className="areaBrief"><Landmark aria-hidden="true" size={22} /><span>{locale === "ar" ? "سياق المبنى" : "Building context"}</span><h3>{locale === "ar" ? "المدخل → المصعد → العتبة" : "Entrance → lift → threshold"}</h3><p>{locale === "ar" ? "تم تسجيل المسار كاملاً، وليس فقط وسم عام لإمكانية الوصول." : "The complete route is recorded, not a generic accessibility tag."}</p><a href="#passport">{locale === "ar" ? "افتح دليل المسار" : "Open route evidence"}<ArrowUpRight size={16} /></a></article>
                    <article className="areaBrief"><CalendarDays aria-hidden="true" size={22} /><span>{locale === "ar" ? "البنية الملتزم بها" : "Committed infrastructure"}</span><h3>{locale === "ar" ? "لا تُعامل كخدمة حالية" : "Not treated as current service"}</h3><p>{locale === "ar" ? "أي تحديث مستقبلي للنقل سيعرض مصدره وتاريخه وحالته بوضوح." : "Any future transport update will show its source, date and status explicitly."}</p><a href="#risks">{locale === "ar" ? "عرض المنهج" : "See the method"}<ArrowUpRight size={16} /></a></article>
                  </div>
                  
                  <div className="mt-8 flex flex-col gap-8">
                    <CommunityAtlas locale={locale} />
                    <DistrictMap3D locale={locale} />
                  </div>
                </section>

                <section className="contentSection" id="transactions" aria-labelledby="transactions-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / 07</p><h2 id="transactions-heading">{text.sections[6][1]}</h2></div>
                  <p>{locale === "ar" ? "معاملات تاريخية من دائرة الأراضي والأملاك." : "Historical transactions from DLD."}</p>
                </div>
                <DldTransactionTable locale={locale} transactions={property.dldTransactions} />
              </section>

              <section className="contentSection" id="risks" aria-labelledby="risks-heading">
                <div className="sectionHeading">
                  <div><p className="eyebrow">RAMA / 08</p><h2 id="risks-heading">{text.sections[7][1]}</h2></div>
                  <p>{locale === "ar" ? "المعلومة الناقصة ظاهرة ولها خطوة تحقق، ولا تتحول إلى درجة مخيفة." : "A gap stays visible and gets a next step; it does not become an alarmist score."}</p>
                </div>
                <div className="riskList">
                  {property.risks.map((risk) => (
                    <article className={`riskCard ${risk.status}`} key={risk.id}>
                      <span className="riskIcon">{risk.status === "unknown" ? <FileQuestion aria-hidden="true" size={20} /> : <CircleAlert aria-hidden="true" size={20} />}</span>
                      <div className="riskMain"><span>{risk.status === "unknown" ? (locale === "ar" ? "غير معروف" : "Unknown") : (locale === "ar" ? "يحتاج مراجعة" : "Review")}</span><h3>{localize(risk.issue, locale)}</h3></div>
                      <dl><div><dt>{locale === "ar" ? "الأثر" : "Impact"}</dt><dd>{localize(risk.impact, locale)}</dd></div><div><dt>{locale === "ar" ? "المصدر" : "Source"}</dt><dd>{localize(risk.source, locale)}</dd></div><div><dt>{locale === "ar" ? "خطوة التحقق التالية" : "Next verification step"}</dt><dd>{localize(risk.nextStep, locale)}</dd></div></dl>
                    </article>
                  ))}
                </div>
              </section>

              <section className="contentSection" id="advisor" aria-labelledby="advisor-heading">
                <div className="advisorCard">
                  <div className="advisorIntro"><p className="eyebrow">RAMA / 09</p><h2 id="advisor-heading">{text.sections[8][1]}</h2><p>{locale === "ar" ? "تابع دون إعادة شرح قرارك. تنتقل الأسئلة والأدلة والسياق معك." : "Continue without retelling your decision. Questions, evidence and context travel with you."}</p><a className="askButton" href="mailto:advisor@example.invalid"><MessageSquareText aria-hidden="true" size={18} />{locale === "ar" ? "متابعة مع مستشار" : "Continue with an advisor"}</a></div>
                  <div className="handoffSummary">
                    <div className="handoffMetric"><span>{locale === "ar" ? "القائمة المختصرة" : "Shortlist context"}</span><strong>{property.advisor.shortlistCount}</strong><small>{locale === "ar" ? "عقارات للمقارنة" : "properties to compare"}</small></div>
                    <div className="handoffMetric"><span>{locale === "ar" ? "وقت الاستجابة" : "Response SLA"}</span><strong>&lt; {property.advisor.responseSlaHours}h</strong><small>{locale === "ar" ? "خلال ساعات العمل" : "during service hours"}</small></div>
                    <div className="questionList"><span>{locale === "ar" ? "٣ أسئلة مفتوحة" : "3 open questions"}</span><ol>{property.advisor.openQuestions.map((question) => <li key={question.en}>{localize(question, locale)}</li>)}</ol></div>
                  </div>
                </div>
                
                <div className="mt-8 mb-8">
                  <AiAdvisorChat locale={locale} />
                </div>

                <DecisionComments locale={locale} />
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="siteFooter">
        <div><strong>RAMA</strong><span>{locale === "ar" ? "الأدلة والملاءمة والمفاضلات في مكان واحد." : "The evidence, fit and trade-off in one place."}</span></div>
        <p>{locale === "ar" ? "لا يحل تحقق راما محل دائرة الأراضي والأملاك أو المشورة القانونية أو التقييم أو المعاينة الفعلية." : "RAMA verification does not replace DLD, legal review, valuation or physical inspection."}</p>
      </footer>
    </div>
  );
}
