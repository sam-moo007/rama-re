"use client";

import React from "react";
import type { EvidenceClaim } from "@rama/contracts";
import { localize, type Locale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle2, HelpCircle, AlertTriangle } from "lucide-react";

interface EvidencePassportProps {
  claims: EvidenceClaim[];
  coverageScore: number;
  locale: Locale;
}

export function EvidencePassport({ claims, coverageScore, locale }: EvidencePassportProps) {
  const isRtl = locale === "ar";

  const getStatusIcon = (status: EvidenceClaim["status"]) => {
    switch (status) {
      case "verified": return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "review": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "stale": return <AlertCircle className="h-5 w-5 text-destructive" />;
      default: return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: EvidenceClaim["status"]) => {
    switch (status) {
      case "verified": return isRtl ? "تم التحقق" : "Verified";
      case "review": return isRtl ? "قيد المراجعة" : "Under Review";
      case "stale": return isRtl ? "قديم" : "Stale";
      default: return isRtl ? "غير معروف" : "Unknown";
    }
  };

  return (
    <Card className="w-full bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          {isRtl ? "جواز السفر العقاري" : "Trust Passport"}
          <Badge variant={coverageScore >= 80 ? "default" : "secondary"}>
            {coverageScore}% {isRtl ? "تغطية الأدلة" : "Evidence Coverage"}
          </Badge>
        </CardTitle>
        <CardDescription>
          {isRtl
            ? "تصف النسبة توافر الأدلة، ولا تقيس جودة العقار أو وضعه القانوني أو جدواه الاستثمارية."
            : "Coverage describes available evidence, not property quality, legal status or investment merit."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[40px]"></TableHead>
                <TableHead>{isRtl ? "المطالبة" : "Claim"}</TableHead>
                <TableHead>{isRtl ? "القيمة الملاحظة" : "Observed Value"}</TableHead>
                <TableHead>{isRtl ? "الحالة" : "Status"}</TableHead>
                <TableHead className="hidden md:table-cell">{isRtl ? "المصدر" : "Source"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="align-top pt-4">
                    {getStatusIcon(claim.status)}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="font-medium text-foreground">
                      {localize(claim.label || { en: "Unknown", ar: "غير معروف" }, locale)}
                      {claim.isCritical && (
                        <Badge variant="destructive" className="ml-2 mr-2 text-[10px] uppercase py-0 px-1.5 h-4">
                          {isRtl ? "حرج" : "Critical"}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="align-top font-semibold">
                    {localize(claim.displayValue || { en: "Unknown", ar: "غير معروف" }, locale)}
                  </TableCell>
                  <TableCell className="align-top">
                    <span className="text-sm font-medium">
                      {getStatusLabel(claim.status)}
                    </span>
                    {claim.status === "review" && claim.nextVerificationStep && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {isRtl ? "الخطوة التالية:" : "Next:"} {localize(claim.nextVerificationStep, locale)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top hidden md:table-cell">
                    <div className="text-sm text-foreground">{localize(claim.source || { en: "Unknown", ar: "غير معروف" }, locale)}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{localize(claim.method || { en: "Unknown", ar: "غير معروف" }, locale)}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
