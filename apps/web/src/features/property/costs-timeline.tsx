"use client";

import React from "react";
import type { CostLine } from "@rama/contracts";
import { localize, type Locale } from "@/lib/i18n";
import { formatAed } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CostsTimelineProps {
  costs: CostLine[];
  locale: Locale;
}

export function CostsTimeline({ costs, locale }: CostsTimelineProps) {
  const isRtl = locale === "ar";

  // Group costs by timing
  const timingOrder = ["reservation", "transaction", "ownership", "exit"];
  
  const timingLabels: Record<string, { en: string; ar: string }> = {
    reservation: { en: "Reservation & Initial Deposit", ar: "الحجز والدفعة الأولى" },
    transaction: { en: "Transaction Costs (DLD, Agency, etc.)", ar: "تكاليف المعاملة (دائرة الأراضي والأملاك، الوكالة، الخ)" },
    ownership: { en: "Recurring Ownership Costs", ar: "تكاليف الملكية المتكررة" },
    exit: { en: "Exit / Resale Costs", ar: "تكاليف الخروج / إعادة البيع" }
  };

  const grouped = costs.reduce((acc, cost) => {
    if (!acc[cost.timing]) acc[cost.timing] = [];
    acc[cost.timing]!.push(cost);
    return acc;
  }, {} as Record<string, CostLine[]>);

  return (
    <div className="space-y-8">
      {timingOrder.map((timing) => {
        const stageCosts = grouped[timing];
        if (!stageCosts || stageCosts.length === 0) return null;

        const stageTotal = stageCosts.reduce((sum, c) => sum + (c.amountAed || 0), 0);
        const label = timingLabels[timing];
        if (!label) return null;

        return (
          <div key={timing} className="relative pl-6 md:pl-8 before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-border rtl:pl-0 rtl:pr-6 rtl:md:pr-8 rtl:before:left-auto rtl:before:right-2">
            <div className="absolute top-2 left-0 rtl:left-auto rtl:right-0 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
            
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center gap-4">
                {isRtl ? label.ar : label.en}
                {stageTotal > 0 && (
                  <Badge variant="secondary" className="text-sm">
                    {isRtl ? "المجموع:" : "Total:"} {formatAed(stageTotal, locale)}
                  </Badge>
                )}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stageCosts.map((cost) => (
                <Card key={cost.id} className="bg-card">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">{localize(cost.label || { en: 'Unknown', ar: 'غير معروف' }, locale)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRtl ? "المصدر:" : "Source:"} {localize(cost.source || { en: 'Unknown', ar: 'غير معروف' }, locale)}
                      </p>
                    </div>
                    <div className="text-right">
                      {cost.amountAed !== null ? (
                        <span className="font-bold whitespace-nowrap">{formatAed(cost.amountAed, locale)}</span>
                      ) : cost.amountRangeAed !== null ? (
                        <span className="font-bold whitespace-nowrap">
                          {formatAed(cost.amountRangeAed[0], locale)} - {formatAed(cost.amountRangeAed[1], locale)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">{isRtl ? "متغير" : "Variable"}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
