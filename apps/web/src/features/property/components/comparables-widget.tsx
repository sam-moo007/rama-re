"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Landmark } from "lucide-react";

export function ComparablesWidget({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  
  // Mock DLD transaction data
  const transactions = [
    { id: 1, date: "2023-11-15", price: 2350000, type: "Sales", size: 2400 },
    { id: 2, date: "2023-09-22", price: 2280000, type: "Sales", size: 2350 },
    { id: 3, date: "2023-06-10", price: 2150000, type: "Sales", size: 2400 },
  ];

  const formatPrice = (price: number) => 
    new Intl.NumberFormat(isAr ? 'ar-AE' : 'en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="border rounded p-5 bg-white shadow-sm mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Landmark className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          {isAr ? "المعاملات التاريخية المماثلة (دائرة الأراضي والأملاك)" : "Historical Comparable Transactions (DLD)"}
        </h3>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {isAr 
          ? "أحدث بيانات المعاملات المسجلة رسمياً لوحدات مشابهة في هذا المجمع." 
          : "Latest officially registered transaction data for similar units in this community."}
      </p>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 border rounded hover:bg-slate-100 transition-colors">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">{formatPrice(tx.price)}</span>
              <span className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString(isAr ? 'ar-AE' : 'en-AE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">{tx.size} sqft</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {isAr ? "دائرة الأراضي" : "DLD Verified"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
        <span className="text-slate-600">
          {isAr ? "اتجاه السوق للمنطقة (6 أشهر):" : "Area Market Trend (6 months):"}
        </span>
        <span className="flex items-center gap-1 text-emerald-600 font-medium">
          <TrendingUp className="w-4 h-4" /> +9.3%
        </span>
      </div>
    </div>
  );
}
