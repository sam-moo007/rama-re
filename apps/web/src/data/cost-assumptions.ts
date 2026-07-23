export type AssumptionType = "fixed" | "estimated";

export interface CostAssumption {
  id: string;
  label: { en: string; ar: string };
  type: AssumptionType;
  valuePercentage: number;
  description: { en: string; ar: string };
  source?: string;
}

export const defaultCostAssumptions: CostAssumption[] = [
  {
    id: "dld_fee",
    label: { en: "DLD Transfer Fee", ar: "رسوم نقل ملكية الأراضي والأملاك" },
    type: "fixed",
    valuePercentage: 4,
    description: { en: "Fixed government fee", ar: "رسوم حكومية ثابتة" },
    source: "Dubai Land Department",
  },
  {
    id: "agency_fee",
    label: { en: "Agency Fee", ar: "رسوم الوكالة" },
    type: "estimated",
    valuePercentage: 2,
    description: { en: "Standard market rate, negotiable", ar: "سعر السوق القياسي، قابل للتفاوض" },
  },
  {
    id: "mortgage_rate",
    label: { en: "Mortgage Rate", ar: "معدل الرهن العقاري" },
    type: "estimated",
    valuePercentage: 4.5,
    description: { en: "Average 5-year fixed rate", ar: "متوسط معدل ثابت لمدة 5 سنوات" },
  },
  {
    id: "down_payment",
    label: { en: "Down Payment", ar: "الدفعة الأولى" },
    type: "estimated",
    valuePercentage: 20,
    description: { en: "Minimum required for residents", ar: "الحد الأدنى المطلوب للمقيمين" },
  },
];
