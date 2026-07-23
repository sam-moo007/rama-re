import type { EvidenceClaim } from "@rama/contracts";
import {
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  CircleAlert,
  FileCheck2,
  HelpCircle,
  MapPinned,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { copy, localize, type Locale } from "@/lib/i18n";

const evidenceClassCopy = {
  en: {
    registry_regulator: "Registry / regulator",
    document_verified: "Document verified",
    on_site_observed: "On-site observed",
    provider_attested: "Provider attested",
    modelled: "Modelled",
    unverified_unknown: "Unverified / unknown",
  },
  ar: {
    registry_regulator: "سجل / جهة تنظيمية",
    document_verified: "مستند موثّق",
    on_site_observed: "ملاحظة في الموقع",
    provider_attested: "إفادة المزوّد",
    modelled: "محسوب بنموذج",
    unverified_unknown: "غير موثّق / غير معروف",
  },
} as const;

const statusIcon = {
  verified: ShieldCheck,
  review: FileCheck2,
  stale: CalendarClock,
  unknown: HelpCircle,
};

const claimIcon = {
  advert_permit_broker: BadgeCheck,
  authority_to_market: FileCheck2,
  service_charge_2025: CalendarClock,
  cooling_arrangement: CircleAlert,
  step_free_route: MapPinned,
  afternoon_construction_noise: HelpCircle,
} as const;

type TrustPassportProps = {
  locale: Locale;
  claims: EvidenceClaim[];
  coverage: number;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TrustPassport({ locale, claims, coverage }: TrustPassportProps) {
  const text = copy[locale];

  return (
    <div className="passportFrame">
      <div className="passportHeader">
        <div>
          <p className="eyebrow">RAMA / 02</p>
          <h2>RAMA Trust Passport</h2>
          <p>{locale === "ar" ? "افتح كل بند لمراجعة مصدره ونطاقه وحداثته." : "Open every item to inspect its source, scope and freshness."}</p>
        </div>
        <div className="passportCoverage">
          <strong>{locale === "ar" ? "18 من 22" : "18 of 22"}</strong>
          <span>{locale === "ar" ? "حقائق موثقة" : "verified facts"}</span>
        </div>
      </div>

      <div className="claimList">
        {claims.map((claim) => {
          const StatusIcon = statusIcon[claim.status];
          const ClaimIcon = claimIcon[claim.key as keyof typeof claimIcon] ?? FileCheck2;
          return (
            <details className={`claimRow status-${claim.status}`} key={claim.id} open={claim.key === "service_charge_2025"}>
              <summary>
                <span className="claimGlyph"><ClaimIcon aria-hidden="true" size={19} /></span>
                <span className="claimIdentity">
                  <strong>{localize(claim.label, locale)}</strong>
                  <span>{evidenceClassCopy[locale][claim.evidenceClass]}</span>
                </span>
                <Badge className="claimState" variant="outline">
                  <StatusIcon aria-hidden="true" size={17} />
                  <strong>{localize(claim.displayValue, locale)}</strong>
                </Badge>
                <span className="claimFreshness">
                  {claim.observedAt ? formatDate(claim.observedAt, locale) : locale === "ar" ? "لا توجد ملاحظة" : "Not observed"}
                </span>
                <span className="claimToggle">{text.viewDetails}<ChevronDown aria-hidden="true" size={16} /></span>
              </summary>
              <div className="claimDetails">
                <dl>
                  <div><dt>{text.latestEvidence}</dt><dd>{localize(claim.displayValue, locale)}</dd></div>
                  <div><dt>{text.sourceClass}</dt><dd>{evidenceClassCopy[locale][claim.evidenceClass]}</dd></div>
                  <div className="wide"><dt>{text.method}</dt><dd>{localize(claim.method, locale)}</dd></div>
                  <div><dt>{locale === "ar" ? "المصدر" : "Source"}</dt><dd>{localize(claim.source, locale)}</dd></div>
                  <div><dt>{text.observed}</dt><dd>{claim.observedAt ? formatDate(claim.observedAt, locale) : "—"}</dd></div>
                  <div><dt>{text.retrieved}</dt><dd>{formatDate(claim.retrievedAt, locale)}</dd></div>
                  <div><dt>{text.validTo}</dt><dd>{claim.validTo ? formatDate(claim.validTo, locale) : "—"}</dd></div>
                  <div><dt>{text.confidence}</dt><dd>{claim.confidence === null ? locale === "ar" ? "غير متاح" : "Not available" : `${Math.round(claim.confidence * 100)}%`}</dd></div>
                  <div><dt>{text.artifact}</dt><dd>{claim.artifactReference ?? "—"}</dd></div>
                  <div><dt>{text.supersedes}</dt><dd>{claim.supersedes ?? "—"}</dd></div>
                </dl>
                {claim.nextVerificationStep ? (
                  <div className="nextEvidenceStep"><CircleAlert aria-hidden="true" size={17} /><span><strong>{locale === "ar" ? "الخطوة التالية" : "Next verification step"}</strong>{localize(claim.nextVerificationStep, locale)}</span></div>
                ) : null}
                <Button className="textButton" variant="link" type="button">{text.requestCorrection}</Button>
              </div>
            </details>
          );
        })}
      </div>
      <p className="passportFootnote">{text.evidenceDisclaimer}</p>
    </div>
  );
}
