"use client";

import React from "react";
import type { PropertyDecisionRoom } from "@rama/contracts";
import { localize, type Locale } from "@/lib/i18n";
import { formatAed } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2 } from "lucide-react";

interface PropertyHeaderProps {
  property: PropertyDecisionRoom;
  locale: Locale;
}

export function PropertyHeader({ property, locale }: PropertyHeaderProps) {
  const isRtl = locale === "ar";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1 font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            {isRtl ? "متاح للشراء" : "Available for Sale"}
          </Badge>
          {property.evidenceCoverage >= 80 && (
            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1 font-medium border-primary text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {isRtl ? "تم التحقق (نسبة عالية)" : "Highly Verified"}
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
          {localize(property.name, locale)}
        </h1>
        
        <div className="flex items-center text-muted-foreground gap-1.5 text-lg">
          <MapPin className="h-5 w-5" />
          <span>{localize(property.community, locale)}</span>
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end">
        <span className="text-sm text-muted-foreground font-medium mb-1">
          {isRtl ? "السعر المطلوب" : "Asking Price"}
        </span>
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {formatAed(property.priceAed, locale)}
        </span>
      </div>
    </div>
  );
}
