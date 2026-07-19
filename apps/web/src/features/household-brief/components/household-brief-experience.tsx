"use client";

import {
  HouseholdBriefInputSchema,
  HouseholdBriefSchema,
  type HouseholdBrief,
  type HouseholdBriefInput,
} from "@rama/contracts";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Home,
  Landmark,
  LockKeyhole,
  Save,
  Send,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress, ProgressLabel } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { Locale } from "@/lib/i18n";

type DraftInput = Omit<HouseholdBriefInput, "consent"> & {
  consent: Omit<HouseholdBriefInput["consent"], "processingAccepted"> & { processingAccepted: boolean };
};

type Props = { initialBrief: HouseholdBrief | null; locale: Locale };
type Message = { kind: "error" | "success"; text: string } | null;

const communities = ["Dubai Marina", "Downtown Dubai", "Dubai Hills Estate", "Jumeirah", "Business Bay"];
const priorityValues = [
  "commute",
  "step_free_access",
  "schools",
  "outdoor_space",
  "quiet_home",
  "rental_yield",
  "building_services",
] as const;

const copy = {
  en: {
    skip: "Skip to brief form",
    brand: "RAMA",
    secure: "Private decision workspace",
    language: "العربية",
    discover: "Discover homes",
    title: "Shape a home brief that works in the real world.",
    intro:
      "Tell us the constraints that matter. RAMA turns them into a versioned brief and an illustrative readiness view—without replacing financial advice.",
    privacy: "Structured answers only. Avoid names, medical details, or other sensitive free text.",
    steps: ["Household", "Budget", "Home fit", "Review"],
    step: "Step",
    of: "of",
    saved: "Saved",
    draft: "Draft",
    submitted: "Submitted",
    householdTitle: "Who is this home for?",
    householdHelp: "We use household structure to keep bedroom and timing constraints coherent.",
    householdSize: "People in household",
    children: "Children in household",
    purpose: "Purchase purpose",
    timeframe: "Move timeframe",
    purposeOptions: { primary_home: "Primary home", investment: "Investment", undecided: "Still deciding" },
    timeframeOptions: { "0_3_months": "0–3 months", "3_6_months": "3–6 months", "6_12_months": "6–12 months", exploring: "Exploring" },
    budgetTitle: "Set the financial guardrails",
    budgetHelp: "Use comfortable limits, not a stretch target. All figures are in AED.",
    maxPrice: "Maximum purchase price (AED)",
    cash: "Available cash (AED)",
    financing: "I expect to use financing",
    monthly: "Comfortable monthly payment (AED)",
    monthlyCash: "Not collected for a cash purchase.",
    fitTitle: "Define the non-negotiables",
    fitHelp: "Choose structured constraints so advisors can compare homes consistently.",
    bedrooms: "Minimum bedrooms (studio = 0)",
    tenure: "Tenure preference",
    tenureOptions: { ready: "Ready property", off_plan: "Off-plan", either: "Either" },
    communities: "Preferred communities (up to 8)",
    priorities: "Top priorities (choose 1–5)",
    priorityOptions: {
      commute: "Commute",
      step_free_access: "Step-free access",
      schools: "Schools",
      outdoor_space: "Outdoor space",
      quiet_home: "Quiet home",
      rental_yield: "Rental yield",
      building_services: "Building services",
    },
    access: "Property access requirements",
    accessOptions: {
      stepFreeAccess: "Step-free entrance",
      liftAccess: "Lift access",
      wheelchairBathroom: "Wheelchair-accessible bathroom",
      lowSensoryEnvironment: "Lower-sensory environment",
    },
    reviewTitle: "Review consent and calculate readiness",
    reviewHelp: "Saving creates a private, auditable brief. You can revise it until submission.",
    processing: "I agree that RAMA may process these answers to create my property brief. Required.",
    advisor: "An advisor may contact me about this brief.",
    analytics: "RAMA may use de-identified answers to improve its service.",
    consentNote: "Consent choices are stored with the brief version and can be changed before submission.",
    save: "Save & calculate",
    saving: "Saving…",
    submit: "Submit brief",
    submitting: "Submitting…",
    next: "Continue",
    back: "Back",
    requiredConsent: "Accept the required processing consent before saving.",
    invalid: "Review the highlighted values. Household, financing, and priority rules must be consistent.",
    saveFailed: "We could not save your brief. Refresh if another session changed it, then try again.",
    savedMessage: "Brief saved and readiness recalculated.",
    submittedMessage: "Brief submitted. Your advisor can now work from this version.",
    readiness: "Illustrative readiness",
    awaiting: "Save the brief to receive a server-calculated readiness view.",
    cashReady: "Cash threshold met",
    cashGap: "Cash gap",
    financeReview: "Financing review",
    minimumCash: "Estimated minimum cash",
    acquisition: "Estimated acquisition costs",
    payment: "Illustrative monthly payment",
    gap: "Estimated cash gap",
    assumptions: "Calculation assumptions",
    version: "Brief version",
    audit: "Audit events",
    lock: "Submitted briefs are locked in this phase.",
  },
  ar: {
    skip: "الانتقال إلى نموذج الملخص",
    brand: "راما",
    secure: "مساحة قرارات خاصة",
    language: "English",
    discover: "اكتشف العقارات",
    title: "أنشئ ملخصاً للسكن يناسب حياتك الفعلية.",
    intro: "شارك القيود المهمة. تحوّلها راما إلى ملخص محفوظ بإصدارات وتقدير استرشادي للجاهزية، من دون أن يحل محل المشورة المالية.",
    privacy: "إجابات منظمة فقط. تجنب الأسماء أو التفاصيل الطبية أو أي نص حر حساس.",
    steps: ["الأسرة", "الميزانية", "ملاءمة السكن", "المراجعة"],
    step: "الخطوة",
    of: "من",
    saved: "محفوظ",
    draft: "مسودة",
    submitted: "مُرسل",
    householdTitle: "لمن سيكون هذا السكن؟",
    householdHelp: "نستخدم تكوين الأسرة لضمان اتساق عدد الغرف والتوقيت.",
    householdSize: "عدد أفراد الأسرة",
    children: "عدد الأطفال",
    purpose: "غرض الشراء",
    timeframe: "موعد الانتقال",
    purposeOptions: { primary_home: "سكن رئيسي", investment: "استثمار", undecided: "لم أقرر بعد" },
    timeframeOptions: { "0_3_months": "0–3 أشهر", "3_6_months": "3–6 أشهر", "6_12_months": "6–12 شهراً", exploring: "مرحلة الاستكشاف" },
    budgetTitle: "حدد الضوابط المالية",
    budgetHelp: "استخدم حدوداً مريحة وليست هدفاً مرهقاً. جميع الأرقام بالدرهم الإماراتي.",
    maxPrice: "الحد الأقصى لسعر الشراء (درهم)",
    cash: "النقد المتاح (درهم)",
    financing: "أتوقع استخدام التمويل",
    monthly: "الدفعة الشهرية المريحة (درهم)",
    monthlyCash: "لا نطلب هذا الرقم عند الشراء النقدي.",
    fitTitle: "حدد الأمور غير القابلة للتنازل",
    fitHelp: "اختر قيوداً منظمة ليتمكن المستشارون من مقارنة العقارات بصورة متسقة.",
    bedrooms: "الحد الأدنى لغرف النوم (استوديو = 0)",
    tenure: "تفضيل حالة العقار",
    tenureOptions: { ready: "عقار جاهز", off_plan: "على المخطط", either: "كلاهما" },
    communities: "المناطق المفضلة (حتى 8)",
    priorities: "الأولويات الرئيسية (اختر 1–5)",
    priorityOptions: {
      commute: "سهولة التنقل",
      step_free_access: "دخول بلا درجات",
      schools: "المدارس",
      outdoor_space: "مساحة خارجية",
      quiet_home: "سكن هادئ",
      rental_yield: "العائد الإيجاري",
      building_services: "خدمات المبنى",
    },
    access: "متطلبات الوصول في العقار",
    accessOptions: {
      stepFreeAccess: "مدخل بلا درجات",
      liftAccess: "توفر مصعد",
      wheelchairBathroom: "حمام ملائم للكراسي المتحركة",
      lowSensoryEnvironment: "بيئة أقل تحفيزاً للحواس",
    },
    reviewTitle: "راجع الموافقات واحسب الجاهزية",
    reviewHelp: "ينشئ الحفظ ملخصاً خاصاً قابلاً للتدقيق. يمكنك تعديله حتى الإرسال.",
    processing: "أوافق على معالجة راما لهذه الإجابات لإنشاء ملخص العقار الخاص بي. مطلوب.",
    advisor: "يمكن لمستشار التواصل معي بشأن هذا الملخص.",
    analytics: "يمكن لراما استخدام إجابات منزوعة الهوية لتحسين الخدمة.",
    consentNote: "تُحفظ خيارات الموافقة مع إصدار الملخص ويمكن تعديلها قبل الإرسال.",
    save: "حفظ وحساب",
    saving: "جارٍ الحفظ…",
    submit: "إرسال الملخص",
    submitting: "جارٍ الإرسال…",
    next: "متابعة",
    back: "رجوع",
    requiredConsent: "وافق على معالجة البيانات المطلوبة قبل الحفظ.",
    invalid: "راجع القيم المدخلة. يجب أن تكون قواعد الأسرة والتمويل والأولويات متسقة.",
    saveFailed: "تعذر حفظ الملخص. حدّث الصفحة إذا عدّلته جلسة أخرى ثم حاول مجدداً.",
    savedMessage: "تم حفظ الملخص وإعادة حساب الجاهزية.",
    submittedMessage: "تم إرسال الملخص. يمكن للمستشار الآن العمل على هذا الإصدار.",
    readiness: "الجاهزية الاسترشادية",
    awaiting: "احفظ الملخص للحصول على تقدير جاهزية محسوب من الخادم.",
    cashReady: "تم استيفاء الحد النقدي",
    cashGap: "فجوة نقدية",
    financeReview: "مراجعة التمويل",
    minimumCash: "الحد النقدي الأدنى التقديري",
    acquisition: "تكاليف الاستحواذ التقديرية",
    payment: "الدفعة الشهرية الاسترشادية",
    gap: "الفجوة النقدية التقديرية",
    assumptions: "افتراضات الحساب",
    version: "إصدار الملخص",
    audit: "أحداث التدقيق",
    lock: "الملخصات المرسلة مقفلة في هذه المرحلة.",
  },
} as const;

const defaults = (locale: Locale): DraftInput => ({
  locale,
  householdSize: 2,
  childrenCount: 0,
  purchasePurpose: "primary_home",
  moveTimeframe: "3_6_months",
  maxPurchasePriceAed: 2_000_000,
  availableCashAed: 600_000,
  financingNeeded: true,
  comfortableMonthlyPaymentAed: 12_000,
  minBedrooms: 2,
  preferredCommunities: ["Dubai Marina"],
  tenurePreference: "ready",
  priorities: ["commute"],
  accessibility: { stepFreeAccess: false, liftAccess: true, wheelchairBathroom: false, lowSensoryEnvironment: false },
  consent: { processingAccepted: false, advisorContactAllowed: false, anonymousAnalyticsAllowed: false },
});

const currency = (value: number | null, locale: Locale) =>
  value === null ? "—" : new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(value);

export function HouseholdBriefExperience({ initialBrief, locale }: Props) {
  const t = copy[locale];
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<HouseholdBrief | null>(initialBrief);
  const [input, setInput] = useState<DraftInput>(() => initialBrief ? initialBrief.input : defaults(locale));
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const locked = brief?.status === "submitted";
  const isRtl = locale === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;
  const progress = ((step + 1) / t.steps.length) * 100;
  const readinessLabel = useMemo(() => {
    if (!brief) return null;
    return brief.readiness.classification === "cash_ready" ? t.cashReady : brief.readiness.classification === "cash_gap" ? t.cashGap : t.financeReview;
  }, [brief, t]);

  const setNumber = (key: "householdSize" | "childrenCount" | "maxPurchasePriceAed" | "availableCashAed" | "minBedrooms", raw: string) => {
    const value = Number(raw);
    setInput((current) => ({ ...current, [key]: Number.isFinite(value) ? value : 0 }));
  };

  const toggleList = <T extends string>(key: "preferredCommunities" | "priorities", value: T, checked: boolean) => {
    setInput((current) => {
      const values = current[key] as readonly string[];
      return { ...current, [key]: checked ? [...values, value] : values.filter((item) => item !== value) } as DraftInput;
    });
  };

  const save = async () => {
    setMessage(null);
    const parsed = HouseholdBriefInputSchema.safeParse({ ...input, locale });
    if (!parsed.success) {
      setMessage({ kind: "error", text: input.consent.processingAccepted ? t.invalid : t.requiredConsent });
      return;
    }
    setBusy("save");
    try {
      const response = await fetch(brief ? `/api/customer/briefs/${brief.id}` : "/api/customer/briefs", {
        method: brief ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(brief ? { expectedVersion: brief.version, input: parsed.data } : { input: parsed.data }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const saved = HouseholdBriefSchema.parse(await response.json());
      setBrief(saved);
      setInput(saved.input);
      setMessage({ kind: "success", text: t.savedMessage });
    } catch {
      setMessage({ kind: "error", text: t.saveFailed });
    } finally {
      setBusy(null);
    }
  };

  const submit = async () => {
    if (!brief || brief.status === "submitted") return;
    setBusy("submit");
    setMessage(null);
    try {
      const response = await fetch(`/api/customer/briefs/${brief.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ expectedVersion: brief.version }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const submitted = HouseholdBriefSchema.parse(await response.json());
      setBrief(submitted);
      setMessage({ kind: "success", text: t.submittedMessage });
    } catch {
      setMessage({ kind: "error", text: t.saveFailed });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="briefApp" dir={isRtl ? "rtl" : "ltr"} lang={locale}>
      <a className="skipLink" href="#brief-form">{t.skip}</a>
      <header className="briefHeader">
        <div className="briefHeaderInner">
          <a className="brand" href={`/${locale}/discover`} aria-label={`${t.brand} — ${t.secure}`}>
            <span className="brandMark" aria-hidden="true">R</span>{t.brand}
          </a>
          <span className="briefSecure"><LockKeyhole aria-hidden="true" />{t.secure}</span>
          <nav className="briefHeaderActions" aria-label={t.secure}>
            <a href={`/${locale}/discover`}>{t.discover}</a>
            <a className="languageLink" href={`/${locale === "en" ? "ar" : "en"}/brief`} lang={locale === "en" ? "ar" : "en"}>{t.language}</a>
          </nav>
        </div>
      </header>

      <main className="briefFrame" id="brief-form">
        <section className="briefIntro" aria-labelledby="brief-title">
          <div>
            <p className="eyebrow">RAMA / {t.secure}</p>
            <h1 id="brief-title">{t.title}</h1>
          </div>
          <div>
            <p>{t.intro}</p>
            <span><LockKeyhole aria-hidden="true" />{t.privacy}</span>
          </div>
        </section>

        <div className="briefShell">
          <aside className="briefSteps" aria-label={`${t.step} ${step + 1} ${t.of} ${t.steps.length}`}>
            <Progress className="briefProgress" value={progress}>
              <ProgressLabel>{t.step} {step + 1}</ProgressLabel>
              <span className="briefProgressValue">{Math.round(progress)}%</span>
            </Progress>
            <nav aria-label={t.step}>
              {t.steps.map((label, index) => (
                <Button key={label} variant="ghost" className="briefStepButton" onClick={() => setStep(index)} aria-current={step === index ? "step" : undefined}>
                  <span>{String(index + 1).padStart(2, "0")}</span>{label}
                </Button>
              ))}
            </nav>
            {brief && (
              <div className="briefVersion">
                <Badge variant={brief.status === "submitted" ? "secondary" : "outline"}>{brief.status === "submitted" ? t.submitted : t.draft}</Badge>
                <span>{t.version}: {brief.version}</span>
                <span>{t.audit}: {brief.auditTrail.length}</span>
              </div>
            )}
          </aside>

          <section className="briefPanel" aria-live="polite">
            {locked && <Alert><LockKeyhole aria-hidden="true" /><AlertTitle>{t.submitted}</AlertTitle><AlertDescription>{t.lock}</AlertDescription></Alert>}
            {step === 0 && (
              <StepCard icon={<Home aria-hidden="true" />} title={t.householdTitle} help={t.householdHelp}>
                <div className="briefFields">
                  <NumberField id="household-size" label={t.householdSize} value={input.householdSize} min={1} max={12} onChange={(value) => setNumber("householdSize", value)} disabled={locked} />
                  <NumberField id="children-count" label={t.children} value={input.childrenCount} min={0} max={10} onChange={(value) => setNumber("childrenCount", value)} disabled={locked} />
                  <SelectField id="purchase-purpose" label={t.purpose} value={input.purchasePurpose} onChange={(value) => setInput((current) => ({ ...current, purchasePurpose: value as HouseholdBriefInput["purchasePurpose"] }))} options={t.purposeOptions} disabled={locked} />
                  <SelectField id="move-timeframe" label={t.timeframe} value={input.moveTimeframe} onChange={(value) => setInput((current) => ({ ...current, moveTimeframe: value as HouseholdBriefInput["moveTimeframe"] }))} options={t.timeframeOptions} disabled={locked} />
                </div>
              </StepCard>
            )}
            {step === 1 && (
              <StepCard icon={<Landmark aria-hidden="true" />} title={t.budgetTitle} help={t.budgetHelp}>
                <div className="briefFields">
                  <NumberField id="max-price" label={t.maxPrice} value={input.maxPurchasePriceAed} min={300000} step={50000} onChange={(value) => setNumber("maxPurchasePriceAed", value)} disabled={locked} />
                  <NumberField id="available-cash" label={t.cash} value={input.availableCashAed} min={0} step={10000} onChange={(value) => setNumber("availableCashAed", value)} disabled={locked} />
                </div>
                <Choice id="financing" label={t.financing} checked={input.financingNeeded} disabled={locked} onChange={(checked) => setInput((current) => ({ ...current, financingNeeded: checked, comfortableMonthlyPaymentAed: checked ? current.comfortableMonthlyPaymentAed ?? 12000 : null }))} />
                {input.financingNeeded ? (
                  <NumberField id="monthly-payment" label={t.monthly} value={input.comfortableMonthlyPaymentAed ?? 12000} min={1000} step={1000} onChange={(value) => setInput((current) => ({ ...current, comfortableMonthlyPaymentAed: Number(value) }))} disabled={locked} />
                ) : <p className="briefHint">{t.monthlyCash}</p>}
              </StepCard>
            )}
            {step === 2 && (
              <StepCard icon={<Home aria-hidden="true" />} title={t.fitTitle} help={t.fitHelp}>
                <div className="briefFields">
                  <NumberField id="bedrooms" label={t.bedrooms} value={input.minBedrooms} min={0} max={8} onChange={(value) => setNumber("minBedrooms", value)} disabled={locked} />
                  <SelectField id="tenure" label={t.tenure} value={input.tenurePreference} onChange={(value) => setInput((current) => ({ ...current, tenurePreference: value as HouseholdBriefInput["tenurePreference"] }))} options={t.tenureOptions} disabled={locked} />
                </div>
                <ChoiceGroup legend={t.communities} values={communities} selected={input.preferredCommunities} disabled={locked} onChange={(value, checked) => toggleList("preferredCommunities", value, checked)} />
                <ChoiceGroup legend={t.priorities} values={priorityValues} labels={t.priorityOptions} selected={input.priorities} disabled={locked} onChange={(value, checked) => toggleList("priorities", value, checked)} />
                <fieldset className="briefChoiceGroup"><legend>{t.access}</legend><div className="briefChoices">
                  {(Object.keys(t.accessOptions) as Array<keyof typeof t.accessOptions>).map((key) => <Choice key={key} id={`access-${key}`} label={t.accessOptions[key]} checked={input.accessibility[key]} disabled={locked} onChange={(checked) => setInput((current) => ({ ...current, accessibility: { ...current.accessibility, [key]: checked } }))} />)}
                </div></fieldset>
              </StepCard>
            )}
            {step === 3 && (
              <StepCard icon={<CheckCircle2 aria-hidden="true" />} title={t.reviewTitle} help={t.reviewHelp}>
                <div className="briefConsent">
                  <Choice id="processing-consent" label={t.processing} checked={input.consent.processingAccepted} disabled={locked} onChange={(checked) => setInput((current) => ({ ...current, consent: { ...current.consent, processingAccepted: checked } }))} />
                  <Choice id="advisor-consent" label={t.advisor} checked={input.consent.advisorContactAllowed} disabled={locked} onChange={(checked) => setInput((current) => ({ ...current, consent: { ...current.consent, advisorContactAllowed: checked } }))} />
                  <Choice id="analytics-consent" label={t.analytics} checked={input.consent.anonymousAnalyticsAllowed} disabled={locked} onChange={(checked) => setInput((current) => ({ ...current, consent: { ...current.consent, anonymousAnalyticsAllowed: checked } }))} />
                  <p>{t.consentNote}</p>
                </div>
                <Readiness brief={brief} locale={locale} labels={{ readiness: t.readiness, awaiting: t.awaiting, minimumCash: t.minimumCash, acquisition: t.acquisition, payment: t.payment, gap: t.gap, assumptions: t.assumptions }} classification={readinessLabel} />
                {message && <Alert variant={message.kind === "error" ? "destructive" : "default"} className="briefMessage"><CircleAlert aria-hidden="true" /><AlertTitle>{message.kind === "error" ? t.invalid : t.saved}</AlertTitle><AlertDescription>{message.text}</AlertDescription></Alert>}
                <div className="briefSubmitActions">
                  <Button size="lg" onClick={save} disabled={busy !== null || locked}><Save data-icon="inline-start" aria-hidden="true" />{busy === "save" ? t.saving : t.save}</Button>
                  <Button size="lg" variant="secondary" onClick={submit} disabled={busy !== null || !brief || locked}><Send data-icon="inline-start" aria-hidden="true" />{busy === "submit" ? t.submitting : t.submit}</Button>
                </div>
              </StepCard>
            )}

            <Separator />
            <div className="briefActions">
              <Button variant="outline" size="lg" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><BackIcon data-icon="inline-start" aria-hidden="true" />{t.back}</Button>
              {step < 3 && <Button size="lg" onClick={() => setStep((current) => Math.min(3, current + 1))}>{t.next}<NextIcon data-icon="inline-end" aria-hidden="true" /></Button>}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StepCard({ icon, title, help, children }: { icon: React.ReactNode; title: string; help: string; children: React.ReactNode }) {
  return <Card className="briefCard"><CardHeader><span className="briefCardIcon">{icon}</span><CardTitle><h2>{title}</h2></CardTitle><CardDescription>{help}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card>;
}

function NumberField({ id, label, value, onChange, disabled, ...props }: { id: string; label: string; value: number; onChange: (value: string) => void; disabled?: boolean; min?: number; max?: number; step?: number }) {
  return <div className="briefField"><label htmlFor={id}>{label}</label><Input id={id} type="number" inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} {...props} /></div>;
}

function SelectField({ id, label, value, onChange, options, disabled }: { id: string; label: string; value: string; onChange: (value: string) => void; options: Record<string, string>; disabled?: boolean }) {
  return <div className="briefField"><span id={`${id}-label`}>{label}</span><Select value={value} onValueChange={(next) => next && onChange(String(next))} disabled={disabled}><SelectTrigger id={id} aria-labelledby={`${id}-label ${id}`}><SelectValue /></SelectTrigger><SelectContent>{Object.entries(options).map(([key, text]) => <SelectItem key={key} value={key}>{text}</SelectItem>)}</SelectContent></Select></div>;
}

function Choice({ id, label, checked, onChange, disabled }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return <label className="briefChoice" htmlFor={id}><Checkbox id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} /><span>{label}</span></label>;
}

function ChoiceGroup<T extends string>({ legend, values, labels, selected, onChange, disabled }: { legend: string; values: readonly T[]; labels?: Record<T, string>; selected: readonly string[]; onChange: (value: T, checked: boolean) => void; disabled?: boolean }) {
  return <fieldset className="briefChoiceGroup"><legend>{legend}</legend><div className="briefChoices">{values.map((value) => <Choice key={value} id={`choice-${value.replaceAll(" ", "-").toLowerCase()}`} label={labels?.[value] ?? value} checked={selected.includes(value)} onChange={(checked) => onChange(value, checked)} disabled={disabled} />)}</div></fieldset>;
}

function Readiness({ brief, locale, labels, classification }: { brief: HouseholdBrief | null; locale: Locale; labels: { readiness: string; awaiting: string; minimumCash: string; acquisition: string; payment: string; gap: string; assumptions: string }; classification: string | null }) {
  if (!brief) return <Card className="readinessCard" size="sm"><CardHeader><CardTitle>{labels.readiness}</CardTitle><CardDescription>{labels.awaiting}</CardDescription></CardHeader></Card>;
  const result = brief.readiness;
  return <Card className="readinessCard"><CardHeader><Badge variant={result.classification === "cash_ready" ? "secondary" : "outline"}>{classification}</Badge><CardTitle>{labels.readiness}</CardTitle></CardHeader><CardContent><dl className="readinessMetrics"><div><dt>{labels.minimumCash}</dt><dd>{currency(result.estimatedMinimumCashAed, locale)}</dd></div><div><dt>{labels.acquisition}</dt><dd>{currency(result.estimatedAcquisitionCostsAed, locale)}</dd></div><div><dt>{labels.payment}</dt><dd>{currency(result.estimatedIllustrativeMonthlyPaymentAed, locale)}</dd></div><div><dt>{labels.gap}</dt><dd>{currency(result.cashGapAed, locale)}</dd></div></dl><Separator /><p className="readinessAssumptions"><strong>{labels.assumptions}:</strong> {result.assumedAcquisitionCostPercent}% costs · {result.assumedLoanToValuePercent ?? 0}% LTV · {result.assumptionVersion}</p><p className="readinessDisclaimer">{result.disclaimer[locale]}</p></CardContent></Card>;
}
