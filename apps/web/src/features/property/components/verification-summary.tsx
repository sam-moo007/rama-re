"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";

export interface PropertyVerification {
  verifiedCount: number;
  totalCount: number;
  lastVerifiedAt: string;
  pendingItems: string[];
}

interface VerificationSummaryProps {
  locale: Locale;
  verification: PropertyVerification | null;
  isLoading?: boolean;
  isError?: boolean;
}

export function VerificationSummary({ locale, verification, isLoading, isError }: VerificationSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAr = locale === "ar";

  if (isError) {
    return (
      <div className="p-5 bg-[var(--risk-tint,#fcf5f3)] text-[var(--risk,#c47c6f)] border border-[var(--risk,#c47c6f)]/20 text-sm">
        {isAr ? "بيانات التحقق غير متاحة. حاول التحديث." : "Verification data unavailable. Try refreshing."}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 border border-border bg-surface space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!verification || verification.totalCount === 0) {
    return (
      <div className="p-5 bg-surface-subtle border border-border text-sm text-text">
        {isAr ? "لا زلنا نجمع المعلومات حول هذا العقار. تحقق مرة أخرى قريباً." : "We're still gathering information about this property. Check back soon."}
      </div>
    );
  }

  const { verifiedCount, totalCount, pendingItems } = verification;
  const isFullyVerified = verifiedCount === totalCount;
  const pct = Math.round((verifiedCount / totalCount) * 100);

  return (
    <div className="border border-border bg-surface p-6 lg:p-8 space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-600 shrink-0" />
            <h3 className="text-xl font-serif text-ink font-light">
              {isAr ? "التحقق" : "Verification"}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-mono font-bold text-ink">{verifiedCount}/{totalCount}</span>
            <span className="text-xs text-text font-medium">
              {isAr ? "حقائق رئيسية موثقة" : "key facts verified"}
            </span>
          </div>
        </div>

        <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 border ${
          isFullyVerified
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : "text-brand bg-brand/10 border-brand/20"
        }`}>
          {isFullyVerified ? (isAr ? "مكتمل" : "Complete") : `${pct}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-subtle border border-border overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Pending items toggle */}
      {pendingItems.length > 0 && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls="verification-details"
            className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-ink transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            {isAr ? (isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل") : (isExpanded ? "Hide details" : "View details")}
            {isExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>

          {isExpanded && (
            <div id="verification-details" className="pt-4 border-t border-border space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted">
                {isAr ? "العناصر قيد التأكيد" : "Items Pending Confirmation"}
              </h4>
              <ul className="space-y-2">
                {pendingItems.map((item, idx) => (
                  <li key={idx} className="text-xs text-text flex items-start gap-2">
                    <span className="text-brand font-bold">—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
