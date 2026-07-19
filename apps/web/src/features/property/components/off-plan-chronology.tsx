import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Locale } from "@/lib/i18n";

interface OffPlanChronologyProps {
  locale: Locale;
}

export function OffPlanChronology({ locale }: OffPlanChronologyProps) {
  const t = locale === "ar" ? {
    title: "التسلسل الزمني للمشروع",
    escrow: "حساب الضمان مسجل",
    escrowDesc: "تم تسجيل حساب الضمان في مؤسسة التنظيم العقاري",
    construction: "تقدم البناء",
    constructionDesc: "تم الإبلاغ عن نسبة إنجاز 45% في آخر تفتيش",
    handover: "التسليم المتوقع",
    handoverDesc: "الربع الرابع 2026",
    variation: "سجل التغييرات",
    variationDesc: "تم تمديد تاريخ التسليم بمقدار 3 أشهر بسبب تحديثات التصميم",
    source: "المصدر: دائرة الأراضي والأملاك"
  } : {
    title: "Project Chronology & Escrow",
    escrow: "Escrow Registered",
    escrowDesc: "RERA approved escrow account active.",
    construction: "Construction Progress",
    constructionDesc: "45% completion reported at last inspection.",
    handover: "Expected Handover",
    handoverDesc: "Q4 2026",
    variation: "Variation Log",
    variationDesc: "Handover extended by 3 months due to design upgrades.",
    source: "Source: DLD Oqood"
  };

  return (
    <div className="bg-white rounded border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">{t.title}</h3>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{t.source}</span>
      </div>
      
      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
        
        <div className="relative">
          <div className="absolute -left-9 top-1 bg-green-100 text-green-700 w-6 h-6 rounded-full flex items-center justify-center">
            <CheckCircle2 size={14} />
          </div>
          <div>
            <h4 className="font-medium">{t.escrow}</h4>
            <p className="text-sm text-slate-600 mt-1">{t.escrowDesc}</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-9 top-1 bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center">
            <Clock size={14} />
          </div>
          <div>
            <h4 className="font-medium">{t.construction}</h4>
            <p className="text-sm text-slate-600 mt-1">{t.constructionDesc}</p>
            <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-9 top-1 bg-amber-100 text-amber-700 w-6 h-6 rounded-full flex items-center justify-center">
            <AlertTriangle size={14} />
          </div>
          <div>
            <h4 className="font-medium">{t.variation}</h4>
            <p className="text-sm text-slate-600 mt-1">{t.variationDesc}</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-9 top-1 bg-slate-100 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
          </div>
          <div>
            <h4 className="font-medium">{t.handover}</h4>
            <p className="text-sm text-slate-600 mt-1">{t.handoverDesc}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
