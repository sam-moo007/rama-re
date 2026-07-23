import type { LocalizedText } from "@rama/contracts";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const localize = (value: LocalizedText, locale: Locale): string => value[locale];

export const copy = {
  en: {
    nav: ["Buy", "Rent", "Off-plan", "Neighbourhoods", "Saved"],
    ask: "Ask RAMA",
    language: "العربية",
    sections: [
      ["what", "What is it?"],
      ["cost", "How much does it cost?"],
      ["where", "Where is it?"],
      ["trust", "Can I trust it?"],
      ["fit", "Is it a good fit?"],
      ["next", "What's next?"],
    ],
    evidenceComplete: "evidence complete",
    evidenceDisclaimer: "Coverage describes available evidence, not property quality, legal status or investment merit.",
    save: "Save",
    compare: "Compare",
    fit: "Why this may fit",
    uncertain: "Still to verify",
    viewDetails: "View details",
    requestCorrection: "Request correction",
    sourceClass: "Source class",
    observed: "Observed",
    retrieved: "Retrieved",
    validTo: "Valid to",
    confidence: "Confidence",
    artifact: "Artifact",
    method: "Method",
    supersedes: "Supersedes",
    latestEvidence: "Evidence state",
    costTitle: "The whole money story",
    costIntro: "Editable assumptions stay separate from sourced facts. Refresh all rules before an offer.",
  },
  ar: {
    nav: ["شراء", "إيجار", "على الخريطة", "الأحياء", "المحفوظات"],
    ask: "اسأل راما",
    language: "English",
    sections: [
      ["what", "ما هو هذا العقار؟"],
      ["cost", "كم سيكلفني؟"],
      ["where", "أين يقع؟"],
      ["trust", "هل يمكنني الوثوق به؟"],
      ["fit", "هل يناسبني؟"],
      ["next", "ما هي الخطوة التالية؟"],
    ],
    evidenceComplete: "من الأدلة مكتملة",
    evidenceDisclaimer: "تصف النسبة توافر الأدلة، ولا تقيس جودة العقار أو وضعه القانوني أو جدواه الاستثمارية.",
    save: "حفظ",
    compare: "مقارنة",
    fit: "أسباب الملاءمة المحتملة",
    uncertain: "ما يحتاج إلى تحقق",
    viewDetails: "عرض التفاصيل",
    requestCorrection: "طلب تصحيح",
    sourceClass: "فئة المصدر",
    observed: "تاريخ الملاحظة",
    retrieved: "تاريخ الاسترجاع",
    validTo: "صالح حتى",
    confidence: "الثقة",
    artifact: "المستند",
    method: "المنهج",
    supersedes: "يحل محل",
    latestEvidence: "حالة الدليل",
    costTitle: "الصورة المالية الكاملة",
    costIntro: "تبقى الافتراضات القابلة للتعديل منفصلة عن الحقائق الموثقة. يجب تحديث القواعد قبل تقديم العرض.",
  },
} as const;
