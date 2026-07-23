import dynamic from "next/dynamic";
import { localize, type Locale } from "@/lib/i18n";
import type { PropertyDecisionRoom } from "@rama/contracts";
import TextReveal from "@/components/pixel-perfect/text-reveal";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { VerificationSummary } from "../verification-summary";
import { TrustPassport } from "../trust-passport";

const OffPlanChronology = dynamic(
  () => import("../off-plan-chronology").then((mod) => mod.OffPlanChronology),
  { loading: () => <div className="h-64 rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Chronology...</div> }
);

const DocumentVault = dynamic(
  () => import("../document-vault").then((mod) => mod.DocumentVault),
  { loading: () => <div className="h-48 rounded-md animate-pulse bg-surface border border-border flex items-center justify-center text-muted text-xs">Loading Vault...</div> }
);

export function TrustSection({
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
    <section id="trust" aria-labelledby="trust-heading">
      <div className="space-y-3 mb-8">
        <p className="text-xs uppercase tracking-widest font-semibold text-brand">RAMA / 04</p>
        <h2 id="trust-heading" className="text-2xl sm:text-3xl font-serif text-ink tracking-tight font-light">
          <TextReveal>{sectionTitle}</TextReveal>
        </h2>
        <p className="text-sm text-text leading-relaxed max-w-xl">
          {isAr ? "الأدلة الموثقة والمستندات المحفوظة." : "Verified evidence and secure documents."}
        </p>
      </div>

      <div className="mb-8">
        {isFeatureEnabled("NORDIC_VERIFICATION_UI") ? (
          <VerificationSummary
            locale={locale}
            verification={{
              totalCount: property.claims.length,
              verifiedCount: property.claims.filter((c) => c.status === "verified").length,
              lastVerifiedAt: property.claims[0]?.observedAt || new Date().toISOString(),
              pendingItems: property.claims.filter((c) => c.status !== "verified").map((c) => localize(c.label, locale))
            }}
          />
        ) : (
          <TrustPassport claims={property.claims} coverage={property.evidenceCoverage} locale={locale} />
        )}
      </div>

      <div className="flex flex-col gap-8">
        <OffPlanChronology locale={locale} />
        <DocumentVault locale={locale} />
      </div>
    </section>
  );
}
// cache bust
