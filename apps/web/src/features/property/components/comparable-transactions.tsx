"use client";

import { Locale } from "@/lib/i18n";

interface ComparableTransactionsProps {
  locale: Locale;
  basePrice: number;
  baseArea: number; // in sqft
}

export function ComparableTransactions({ locale, basePrice, baseArea }: ComparableTransactionsProps) {
  const basePricePerSqft = basePrice / baseArea;

  // Generate slightly randomized comparables anchored strictly to the base property's specs
  const comps = [
    { 
      date: "2026-06-15", 
      unit: "Unit 1104", 
      price: Math.round(basePrice * 0.98), 
      sqft: baseArea,
      psf: Math.round((basePrice * 0.98) / baseArea)
    },
    { 
      date: "2026-05-22", 
      unit: "Unit 1205", 
      price: Math.round(basePrice * 1.05), 
      sqft: baseArea + 150,
      psf: Math.round((basePrice * 1.05) / (baseArea + 150))
    },
    { 
      date: "2026-04-10", 
      unit: "Unit 0904", 
      price: Math.round(basePrice * 0.95), 
      sqft: baseArea,
      psf: Math.round((basePrice * 0.95) / baseArea)
    }
  ];

  return (
    <div className="bg-white border rounded overflow-hidden mt-6">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold">
          {locale === "ar" ? "المعاملات المشابهة (دائرة الأراضي والأملاك)" : "Comparable Transactions (DLD)"}
        </h3>
        <span className="text-sm font-medium text-slate-500">
          {locale === "ar" ? "متوسط السعر للقدم: " : "Base PSF: "} 
          AED {Math.round(basePricePerSqft).toLocaleString()}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">{locale === "ar" ? "التاريخ" : "Date"}</th>
              <th className="px-4 py-3 font-medium">{locale === "ar" ? "الوحدة" : "Unit"}</th>
              <th className="px-4 py-3 font-medium">{locale === "ar" ? "السعر (درهم)" : "Price (AED)"}</th>
              <th className="px-4 py-3 font-medium">{locale === "ar" ? "المساحة (قدم مربع)" : "Area (sqft)"}</th>
              <th className="px-4 py-3 font-medium">{locale === "ar" ? "سعر القدم" : "Price/sqft"}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {comps.map((comp, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{comp.date}</td>
                <td className="px-4 py-3 font-medium">{comp.unit}</td>
                <td className="px-4 py-3 text-blue-600 font-bold">{comp.price.toLocaleString()}</td>
                <td className="px-4 py-3">{comp.sqft.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    comp.psf > basePricePerSqft 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {comp.psf.toLocaleString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
