"use client";

import React from "react";
import type { DecisionRisk } from "@rama/contracts";
import { localize, type Locale } from "@/lib/i18n";
import { AlertTriangle, Info } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface RiskAnalysisProps {
  risks: DecisionRisk[];
  locale: Locale;
}

export function RiskAnalysis({ risks, locale }: RiskAnalysisProps) {
  const isRtl = locale === "ar";

  if (risks.length === 0) {
    return (
      <div className="p-8 text-center border rounded bg-muted/20">
        <Info className="w-8 h-8 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">
          {isRtl ? "لم يتم تحديد أي مخاطر" : "No risks identified"}
        </h3>
        <p className="text-muted-foreground mt-2">
          {isRtl 
            ? "بناءً على الأدلة الحالية، لا توجد مخاطر كبيرة تستدعي المراجعة." 
            : "Based on current evidence, there are no significant risks flagged for review."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="text-amber-500 h-6 w-6" />
        <h2 className="text-2xl font-bold">
          {isRtl ? "تحليل المخاطر" : "Risk Analysis"}
        </h2>
      </div>

      <Accordion className="w-full">
        {risks.map((risk) => (
          <AccordionItem key={risk.id} value={risk.id} className="border rounded mb-4 px-4 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left rtl:text-right">
                <Badge variant={risk.status === "review" ? "destructive" : "secondary"}>
                  {risk.status === "review" 
                    ? (isRtl ? "مطلوب مراجعة" : "Review Required") 
                    : (isRtl ? "غير معروف" : "Unknown")}
                </Badge>
                <span className="font-semibold text-base">{localize(risk.issue, locale)}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 space-y-4 text-muted-foreground">
              <div>
                <strong className="text-foreground">{isRtl ? "التأثير المحتمل:" : "Potential Impact:"}</strong>{" "}
                {localize(risk.impact, locale)}
              </div>
              <div className="flex flex-col gap-1">
                <strong className="text-foreground">{isRtl ? "الخطوة التالية الموصى بها:" : "Recommended Next Step:"}</strong>
                <div className="p-3 bg-secondary/50 rounded text-foreground">
                  {localize(risk.nextStep, locale)}
                </div>
              </div>
              <div className="text-xs">
                <strong className="text-foreground">{isRtl ? "المصدر:" : "Source:"}</strong> {localize(risk.source, locale)}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
