import dynamic from "next/dynamic";
import { localize, type Locale } from "@/lib/i18n";
import type { PropertyDecisionRoom } from "@rama/contracts";
import TextReveal from "@/components/pixel-perfect/text-reveal";
import PremiumButton from "@/components/pixel-perfect/premium-button";
import { MessageSquareText } from "lucide-react";

const AiAdvisorChat = dynamic(
  () => import("@/features/advisor/components/ai-advisor-chat").then((mod) => mod.AiAdvisorChat),
  { loading: () => <div className="h-[400px] rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Advisor Chat...</div> }
);

const DecisionComments = dynamic(
  () => import("../decision-comments").then((mod) => mod.DecisionComments),
  { loading: () => <div className="h-48 rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Comments...</div> }
);

export function NextSection({
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
    <section id="next" aria-labelledby="next-heading">
      <div className="border border-border bg-surface p-8 lg:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-widest font-semibold text-brand">RAMA / 06</p>
            <h2 id="next-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-light">
              <TextReveal>{sectionTitle}</TextReveal>
            </h2>
            <p className="text-sm text-text leading-relaxed">
              {isAr ? "تابع دون إعادة شرح قرارك. تنتقل الأسئلة والأدلة والسياق معك." : "Continue without retelling your decision. Questions, evidence and context travel with you."}
            </p>
            <PremiumButton premiumVariant="dark" asChild className="inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-semibold w-fit mt-2">
              <a href="mailto:advisor@example.invalid">
                <MessageSquareText aria-hidden="true" className="size-4" />
                {isAr ? "متابعة مع مستشار" : "Continue with an advisor"}
              </a>
            </PremiumButton>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted">{isAr ? "القائمة المختصرة" : "Shortlist context"}</span>
                <strong className="block text-2xl font-mono font-bold text-ink">{property.advisor.shortlistCount}</strong>
                <small className="text-xs text-text">{isAr ? "عقارات للمقارنة" : "properties to compare"}</small>
              </div>
              <div className="border border-border p-4 space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-muted">{isAr ? "وقت الاستجابة" : "Response SLA"}</span>
                <strong className="block text-2xl font-mono font-bold text-ink">&lt; {property.advisor.responseSlaHours}h</strong>
                <small className="text-xs text-text">{isAr ? "خلال ساعات العمل" : "during service hours"}</small>
              </div>
            </div>
            <div className="border border-border p-4 space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-bold text-muted">{isAr ? "٣ أسئلة مفتوحة" : "3 open questions"}</span>
              <ol className="list-decimal list-inside text-xs text-text space-y-1">
                {property.advisor.openQuestions.map((question) => (
                  <li key={question.en}>{localize(question, locale)}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-8">
        <AiAdvisorChat locale={locale} />
      </div>

      <DecisionComments locale={locale} />
    </section>
  );
}
// cache bust
