"use client";

import React from "react";
import Image from "next/image";
import type { PropertySearchResultItem } from "@rama/contracts";

import { localize, type Locale } from "@/lib/i18n";
import { formatAed } from "@/lib/format";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Check, X, HelpCircle } from "lucide-react";

interface CompareTableProps {
  properties: PropertySearchResultItem[];
  locale: Locale;
}

export function CompareTable({ properties, locale }: CompareTableProps) {
  const isRtl = locale === "ar";

  if (properties.length === 0) {
    return null;
  }

  // Helper to determine the "best" value for highlighting
  const maxPrice = Math.max(...properties.map(p => p.priceAed));
  const minPrice = Math.min(...properties.map(p => p.priceAed));
  const maxFit = Math.max(...properties.map(p => p.fitScore));

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded border" dir={isRtl ? "rtl" : "ltr"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px] sticky left-0 bg-background z-10 shadow-[1px_0_0_0_#e2e8f0]">
              {/* Empty top-left cell */}
            </TableHead>
            {properties.map((property) => (
              <TableHead key={property.id} className="min-w-[300px] p-4 align-top">
                <Card className="flex flex-col gap-3 p-4 border-none shadow-none bg-transparent">
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-muted">
                    {/* Fallback image placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                      <Image
                        src={`/api/placeholder/400/225`}
                        alt={localize(property.name, locale)}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg truncate" title={localize(property.name, locale)}>
                      {localize(property.name, locale)}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {localize(property.community, locale)}
                    </p>
                  </div>
                </Card>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* PRICE ROW */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background shadow-[1px_0_0_0_#e2e8f0]">
              {isRtl ? "السعر (درهم)" : "Price (AED)"}
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id} className="text-lg">
                <span className={property.priceAed === minPrice ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>
                  {formatAed(property.priceAed, locale)}
                </span>
              </TableCell>
            ))}
          </TableRow>

          {/* FIT SCORE ROW */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background shadow-[1px_0_0_0_#e2e8f0]">
              {isRtl ? "درجة المطابقة" : "Fit Score"}
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id}>
                <Badge variant={property.fitScore === maxFit ? "default" : "secondary"}>
                  {property.fitScore}%
                </Badge>
              </TableCell>
            ))}
          </TableRow>

          {/* TENURE ROW */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background shadow-[1px_0_0_0_#e2e8f0]">
              {isRtl ? "حالة العقار" : "Tenure"}
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id}>
                {property.tenure === "ready" 
                  ? (isRtl ? "جاهز" : "Ready") 
                  : (isRtl ? "قيد الإنشاء" : "Off-plan")}
              </TableCell>
            ))}
          </TableRow>

          {/* SIZE ROW */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background shadow-[1px_0_0_0_#e2e8f0]">
              {isRtl ? "المساحة الداخلية" : "Internal Area"}
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id}>
                {property.internalAreaSqFt ? (
                  <span>{property.internalAreaSqFt.toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-US')} sqft</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            ))}
          </TableRow>

          {/* BED/BATH ROW */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background shadow-[1px_0_0_0_#e2e8f0]">
              {isRtl ? "غرف / حمامات" : "Beds / Baths"}
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id}>
                {property.bedrooms ?? "-"} {isRtl ? "غ" : "Beds"} / {property.bathrooms ?? "-"} {isRtl ? "ح" : "Baths"}
              </TableCell>
            ))}
          </TableRow>

          {/* EVIDENCE COVERAGE ROW */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background shadow-[1px_0_0_0_#e2e8f0]">
              {isRtl ? "تغطية الأدلة" : "Evidence Coverage"}
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full max-w-[100px] bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${property.evidenceCoverage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">{property.evidenceCoverage}%</span>
                </div>
              </TableCell>
            ))}
          </TableRow>

          {/* STEP FREE ACCESS ROW */}
          <TableRow>
            <TableCell className="font-medium sticky left-0 bg-background shadow-[1px_0_0_0_#e2e8f0]">
              {isRtl ? "وصول بدون سلالم" : "Step-Free Access"}
            </TableCell>
            {properties.map((property) => (
              <TableCell key={property.id}>
                {property.stepFreeAccess === "verified" && <Check className="text-emerald-500 h-5 w-5" />}
                {property.stepFreeAccess === "review" && <X className="text-destructive h-5 w-5" />}
                {property.stepFreeAccess === "unknown" && <HelpCircle className="text-muted-foreground h-5 w-5" />}
              </TableCell>
            ))}
          </TableRow>

        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
