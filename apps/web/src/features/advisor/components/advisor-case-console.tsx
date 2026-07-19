"use client";

import {
  AdvisorCaseContextResponseSchema,
  AdvisorDecisionCaseSchema,
  CustomerNotificationSchema,
  type AdvisorCaseContextResponse,
  type AdvisorCaseQueueResponse,
  type AdvisorDecisionCase,
} from "@rama/contracts";
import { BellRing, CheckCircle2, CircleAlert, Clock3, LockKeyhole, Send, ShieldCheck, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

type Props = { initialQueue: AdvisorCaseQueueResponse; locale: Locale };
type Outcome = "questions_answered" | "viewing_progressed" | "not_proceeding";

const copy = {
  en: {
    skip: "Skip to case workspace", brand: "RAMA", title: "Advisor cases", secure: "Protected advisor operations", language: "العربية",
    heading: "Turn customer intent into a documented response.", intro: "Claim unassigned handoffs, work from the exact minimized context snapshot, and close the loop before the SLA expires.", privacy: "Customer identifiers, contact details, exact cash and payment figures are excluded from this browser boundary.",
    requested: "Requested", assigned: "Assigned to me", overdue: "Overdue", queue: "Case queue", empty: "No cases need attention", emptyHelp: "New consented customer handoffs will appear here in response-due order.", caseRef: "Case reference", due: "Response due", properties: "Properties", topics: "Structured topics", reason: "Primary reason", channel: "Contact channel", versions: "Source versions", retention: "Retention until", audit: "Audit trail", claim: "Claim case", claiming: "Claiming…", close: "Close case", closing: "Closing…", outcome: "Outcome", outcomes: { questions_answered: "Questions answered", viewing_progressed: "Viewing progressed", not_proceeding: "Not proceeding" }, selectedHelp: "Select a case from the queue.", failed: "The case changed, consent was withdrawn, or the update failed. Refresh and try again.", claimed: "Case assigned to you.", closed: "Case closed with an auditable outcome.",
    context: "Minimized customer context", contextHelp: "A case-time snapshot containing only fields needed for this handoff.", loadingContext: "Loading consent-checked context…", contextUnavailable: "Context is unavailable because consent changed or the case is no longer visible.", purpose: "Purchase purpose", timeframe: "Move timeframe", ceiling: "Price ceiling", financing: "Financing needed", bedrooms: "Minimum bedrooms", communities: "Preferred communities", tenure: "Tenure preference", priorities: "Priorities", access: "Access requirements", readiness: "Readiness classification", yes: "Yes", no: "No", none: "None selected", snapshot: "Snapshot policy",
    accessLabels: { stepFreeAccess: "Step-free access", liftAccess: "Lift access", wheelchairBathroom: "Wheelchair bathroom", lowSensoryEnvironment: "Low-sensory environment" },
  },
  ar: {
    skip: "الانتقال إلى مساحة الحالة", brand: "راما", title: "حالات المستشار", secure: "عمليات مستشار محمية", language: "English",
    heading: "حوّل نية العميل إلى استجابة موثقة.", intro: "تولّ الحالات غير المعينة واعمل من لقطة سياق مصغرة ودقيقة وأغلق الحلقة قبل انتهاء مدة الاستجابة.", privacy: "تُستبعد هوية العميل وبيانات الاتصال والأرقام الدقيقة للنقد والدفعات من حدود المتصفح هذه.",
    requested: "مطلوبة", assigned: "معينة لي", overdue: "متأخرة", queue: "قائمة الحالات", empty: "لا توجد حالات تحتاج إلى انتباه", emptyHelp: "ستظهر طلبات العملاء الموافق عليها هنا حسب موعد الاستجابة.", caseRef: "مرجع الحالة", due: "موعد الاستجابة", properties: "العقارات", topics: "موضوعات منظمة", reason: "السبب الرئيسي", channel: "قناة الاتصال", versions: "إصدارات المصدر", retention: "الاحتفاظ حتى", audit: "سجل التدقيق", claim: "تولي الحالة", claiming: "جارٍ التولي…", close: "إغلاق الحالة", closing: "جارٍ الإغلاق…", outcome: "النتيجة", outcomes: { questions_answered: "تمت الإجابة عن الأسئلة", viewing_progressed: "تقدمت المعاينة", not_proceeding: "عدم المتابعة" }, selectedHelp: "اختر حالة من القائمة.", failed: "تغيرت الحالة أو سُحبت الموافقة أو تعذر التحديث. حدّث الصفحة وحاول مجدداً.", claimed: "تم تعيين الحالة لك.", closed: "تم إغلاق الحالة بنتيجة قابلة للتدقيق.",
    context: "سياق العميل المصغر", contextHelp: "لقطة وقت إنشاء الحالة تحتوي فقط على الحقول اللازمة لهذا التسليم.", loadingContext: "جارٍ تحميل السياق بعد التحقق من الموافقة…", contextUnavailable: "السياق غير متاح لأن الموافقة تغيرت أو لم تعد الحالة مرئية.", purpose: "غرض الشراء", timeframe: "الإطار الزمني للانتقال", ceiling: "الحد الأعلى للسعر", financing: "الحاجة إلى تمويل", bedrooms: "الحد الأدنى لغرف النوم", communities: "المناطق المفضلة", tenure: "تفضيل حالة العقار", priorities: "الأولويات", access: "متطلبات الوصول", readiness: "تصنيف الجاهزية", yes: "نعم", no: "لا", none: "لا يوجد", snapshot: "سياسة اللقطة",
    accessLabels: { stepFreeAccess: "دخول بلا درجات", liftAccess: "مصعد", wheelchairBathroom: "حمام للكرسي المتحرك", lowSensoryEnvironment: "بيئة منخفضة التحفيز" },
  },
} as const;

export function AdvisorCaseConsole({ initialQueue, locale }: Props) {
  const t = copy[locale];
  const rtl = locale === "ar";
  const [items, setItems] = useState(initialQueue.items);
  const [selectedId, setSelectedId] = useState(initialQueue.items[0]?.id ?? null);
  const [contextResult, setContextResult] = useState<{ caseId: string; data: AdvisorCaseContextResponse | null; state: "idle" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("questions_answered");
  const selected = items.find((item) => item.id === selectedId) ?? null;
  const selectedVersion = selected?.version;
  const context = contextResult?.caseId === selectedId ? contextResult.data : null;
  const contextState: "idle" | "loading" | "error" = contextResult?.caseId === selectedId ? contextResult.state : "loading";
  const metrics = useMemo(() => ({
    requested: items.filter((item) => item.status === "requested").length,
    assigned: items.filter((item) => item.status === "assigned").length,
    overdue: items.filter((item) => item.status === "requested" && item.responseDueAt < new Date().toISOString()).length,
  }), [items]);

  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    void fetch(`/api/advisor/advisor/cases/${selectedId}/context`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(String(response.status));
        setContextResult({ caseId: selectedId, data: AdvisorCaseContextResponseSchema.parse(await response.json()), state: "idle" });
      })
      .catch((error) => { if (error?.name !== "AbortError") setContextResult({ caseId: selectedId, data: null, state: "error" }); });
    return () => controller.abort();
  }, [selectedId, selectedVersion]);

  const update = async (action: "claim" | "close") => {
    if (!selected) return;
    setBusy(true); setNotice(null);
    try {
      const response = await fetch(`/api/advisor/advisor/cases/${selected.id}/${action}`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(action === "claim" ? { expectedVersion: selected.version } : { expectedVersion: selected.version, outcome }),
      });
      if (!response.ok) throw new Error(String(response.status));
      const updated = AdvisorDecisionCaseSchema.parse(await response.json());
      if (updated.status === "closed") {
        setItems((current) => {
          const next = current.filter((item) => item.id !== updated.id);
          setSelectedId(next[0]?.id ?? null);
          return next;
        });
      } else setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice({ kind: "success", text: action === "claim" ? t.claimed : t.closed });
    } catch { setNotice({ kind: "error", text: t.failed }); }
    finally { setBusy(false); }
  };

  return <div className="advisorOpsApp" dir={rtl ? "rtl" : "ltr"} lang={locale}>
    <a className="skipLink" href="#advisor-workspace">{t.skip}</a>
    <header className="advisorOpsHeader"><div><a className="brand" href={`/${locale}/advisor/cases`}><span className="brandMark" aria-hidden="true">R</span>{t.brand}</a><span className="advisorOpsTitle"><small>{t.secure}</small><strong>{t.title}</strong></span><a href={`/${locale === "en" ? "ar" : "en"}/advisor/cases`} lang={locale === "en" ? "ar" : "en"}>{t.language}</a></div></header>
    <main className="advisorOpsFrame" id="advisor-workspace">
      <section className="advisorOpsIntro"><div><p className="eyebrow">RAMA / ADVISOR OPERATIONS</p><h1>{t.heading}</h1></div><div><p>{t.intro}</p><span><LockKeyhole aria-hidden="true" />{t.privacy}</span></div></section>
      <div className="advisorMetrics"><Metric label={t.requested} value={metrics.requested} /><Metric label={t.assigned} value={metrics.assigned} /><Metric label={t.overdue} value={metrics.overdue} risk={metrics.overdue > 0} /></div>
      {notice && <Alert className="advisorNotice" variant={notice.kind === "error" ? "destructive" : "default"}><CircleAlert aria-hidden="true" /><AlertTitle>{notice.text}</AlertTitle></Alert>}
      <div className="advisorWorkspace">
        <aside className="advisorQueue"><h2>{t.queue}</h2>{items.length ? items.map((item) => <Button key={item.id} variant="ghost" className="advisorQueueItem" aria-current={selectedId === item.id ? "true" : undefined} onClick={() => setSelectedId(item.id)}><span><Badge variant={item.status === "assigned" ? "secondary" : "outline"}>{item.status === "assigned" ? t.assigned : t.requested}</Badge><strong>{item.id.slice(0, 8)}</strong><small>{format(item.responseDueAt, locale)}</small></span><Clock3 aria-hidden="true" /></Button>) : <Alert><CheckCircle2 aria-hidden="true" /><AlertTitle>{t.empty}</AlertTitle><AlertDescription>{t.emptyHelp}</AlertDescription></Alert>}</aside>
        <section className="advisorCasePanel">{selected ? <CaseDetail item={selected} locale={locale} text={t} context={context} contextState={contextState} outcome={outcome} onOutcome={(value) => setOutcome(value as Outcome)} busy={busy} onClaim={() => update("claim")} onClose={() => update("close")} /> : <p>{t.selectedHelp}</p>}</section>
      </div>
    </main>
  </div>;
}

type Text = typeof copy.en | typeof copy.ar;
function Metric({ label, value, risk = false }: { label: string; value: number; risk?: boolean }) { return <Card className={risk ? "metricRisk" : ""}><CardContent><span>{label}</span><strong>{value}</strong></CardContent></Card>; }
function format(value: string, locale: Locale) { return new Intl.DateTimeFormat(locale === "ar" ? "ar-AE" : "en-AE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function CaseDetail({ item, locale, text: t, context, contextState, outcome, onOutcome, busy, onClaim, onClose }: { item: AdvisorDecisionCase; locale: Locale; text: Text; context: AdvisorCaseContextResponse | null; contextState: "idle" | "loading" | "error"; outcome: string; onOutcome: (value: string) => void; busy: boolean; onClaim: () => void; onClose: () => void }) {
  return <Card className="advisorCaseCard"><CardHeader><Badge variant={item.status === "assigned" ? "secondary" : "outline"}>{item.status === "assigned" ? t.assigned : t.requested}</Badge><CardTitle><h2>{t.caseRef} {item.id.slice(0, 8)}</h2></CardTitle><CardDescription>{t.due}: {format(item.responseDueAt, locale)}</CardDescription></CardHeader><CardContent>
    <dl className="advisorCaseFacts"><div><dt>{t.reason}</dt><dd>{item.reason.replaceAll("_", " ")}</dd></div><div><dt>{t.channel}</dt><dd>{item.preferredContactChannel.replaceAll("_", " ")}</dd></div><div><dt>{t.versions}</dt><dd>brief v{item.briefVersion} · shortlist v{item.shortlistVersion}</dd></div><div><dt>{t.retention}</dt><dd>{format(item.retentionUntil, locale)}</dd></div></dl>
    <section><h3>{t.properties}</h3><div className="advisorTags">{item.propertySlugs.map((slug) => <Badge variant="outline" key={slug}>{slug}</Badge>)}</div></section>
    <section><h3>{t.topics}</h3><div className="advisorTags">{item.topics.map((topic) => <Badge variant="secondary" key={topic}>{topic.replaceAll("_", " ")}</Badge>)}</div></section>
    <ContextPanel context={context} state={contextState} locale={locale} text={t} />
    <section><h3>{t.audit}</h3><ol className="advisorAudit">{item.auditTrail.map((event) => <li key={event.id}><span>{event.action}</span><small>{format(event.createdAt, locale)} · v{event.version}</small></li>)}</ol></section>
    {item.status === "requested" ? <Button size="lg" onClick={onClaim} disabled={busy || contextState !== "idle" || !context}><UserRoundCheck data-icon="inline-start" aria-hidden="true" />{busy ? t.claiming : t.claim}</Button> : <><AdvisorMessageComposer item={item} locale={locale}/><div className="advisorClose"><div><span id="case-outcome-label">{t.outcome}</span><Select value={outcome} onValueChange={(next) => next && onOutcome(String(next))}><SelectTrigger aria-labelledby="case-outcome-label"><SelectValue>{t.outcomes[outcome as keyof typeof t.outcomes]}</SelectValue></SelectTrigger><SelectContent>{Object.entries(t.outcomes).map(([key, label]) => <SelectItem value={key} key={key}>{label}</SelectItem>)}</SelectContent></Select></div><Button size="lg" onClick={onClose} disabled={busy || contextState !== "idle" || !context}><CheckCircle2 data-icon="inline-start" aria-hidden="true" />{busy ? t.closing : t.close}</Button></div></>}
  </CardContent></Card>;
}

function ContextPanel({ context, state, locale, text: t }: { context: AdvisorCaseContextResponse | null; state: "idle" | "loading" | "error"; locale: Locale; text: Text }) {
  if (state === "loading") return <Alert className="advisorContextState"><Clock3 aria-hidden="true" /><AlertTitle>{t.loadingContext}</AlertTitle></Alert>;
  if (state === "error" || !context) return <Alert className="advisorContextState" variant="destructive"><CircleAlert aria-hidden="true" /><AlertTitle>{t.contextUnavailable}</AlertTitle></Alert>;
  const snapshot = context.context;
  const access = Object.entries(snapshot.accessibility).filter(([, enabled]) => enabled).map(([key]) => t.accessLabels[key as keyof typeof t.accessLabels]);
  return <section className="advisorContext"><header><ShieldCheck aria-hidden="true" /><div><h3>{t.context}</h3><p>{t.contextHelp}</p></div></header><dl>
    <div><dt>{t.purpose}</dt><dd>{snapshot.purchasePurpose.replaceAll("_", " ")}</dd></div><div><dt>{t.timeframe}</dt><dd>{snapshot.moveTimeframe.replaceAll("_", " ")}</dd></div>
    <div><dt>{t.ceiling}</dt><dd>{new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", { style: "currency", currency: "AED", maximumFractionDigits: 0 }).format(snapshot.maxPurchasePriceAed)}</dd></div><div><dt>{t.financing}</dt><dd>{snapshot.financingNeeded ? t.yes : t.no}</dd></div>
    <div><dt>{t.bedrooms}</dt><dd>{snapshot.minBedrooms}</dd></div><div><dt>{t.tenure}</dt><dd>{snapshot.tenurePreference.replaceAll("_", " ")}</dd></div>
    <div><dt>{t.communities}</dt><dd>{snapshot.preferredCommunities.join(" · ") || t.none}</dd></div><div><dt>{t.priorities}</dt><dd>{snapshot.priorities.map((value) => value.replaceAll("_", " ")).join(" · ")}</dd></div>
    <div><dt>{t.access}</dt><dd>{access.join(" · ") || t.none}</dd></div><div><dt>{t.readiness}</dt><dd>{snapshot.readiness.classification.replaceAll("_", " ")}</dd></div>
    <div><dt>{t.snapshot}</dt><dd>{snapshot.snapshotVersion} · brief v{context.briefVersion}</dd></div>
  </dl><p>{snapshot.readiness.disclaimer[locale]}</p></section>;
}

function AdvisorMessageComposer({item,locale}:{item:AdvisorDecisionCase;locale:Locale}){
  const text=locale==="ar"?{title:"إرسال تحديث منظم",help:"تحدد راما القناة المفضلة من الحالة وتتحقق من موافقة العميل وتفضيلاته وحالة التحقق على الخادم.",label:"قالب التحديث",send:"إرسال التحديث",sending:"جارٍ الإرسال…",failed:"تعذر تسليم التحديث أو تغيرت الحالة.",result:"نتيجة التسليم",templates:{advisor_acknowledgement:"إقرار استلام الحالة",information_request:"طلب معلومات",questions_answered:"تمت الإجابة عن الأسئلة",viewing_coordination:"تنسيق المعاينة",financing_follow_up:"متابعة التمويل"}}:{title:"Send a structured update",help:"RAMA resolves the preferred channel from the case and checks customer consent, preferences and verification server-side.",label:"Update template",send:"Send update",sending:"Sending…",failed:"The update could not be delivered or the case changed.",result:"Delivery result",templates:{advisor_acknowledgement:"Case acknowledgement",information_request:"Information request",questions_answered:"Questions answered",viewing_coordination:"Viewing coordination",financing_follow_up:"Financing follow-up"}};
  const [template,setTemplate]=useState<keyof typeof text.templates>("advisor_acknowledgement");const [busy,setBusy]=useState(false);const [result,setResult]=useState<ReturnType<typeof CustomerNotificationSchema.parse>|null>(null);const [error,setError]=useState(false);
  const send=async()=>{setBusy(true);setError(false);try{const response=await fetch(`/api/advisor/advisor/cases/${item.id}/messages`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({expectedCaseVersion:item.version,template})});if(!response.ok)throw new Error(String(response.status));setResult(CustomerNotificationSchema.parse(await response.json()));}catch{setError(true)}finally{setBusy(false)}};
  return <section className="advisorMessage"><header><BellRing aria-hidden="true"/><div><h3>{text.title}</h3><p>{text.help}</p></div></header><div><span id={`message-template-${item.id}`}>{text.label}</span><Select value={template} onValueChange={(value)=>value&&setTemplate(value as typeof template)}><SelectTrigger aria-labelledby={`message-template-${item.id}`}><SelectValue>{text.templates[template]}</SelectValue></SelectTrigger><SelectContent>{Object.entries(text.templates).map(([value,label])=><SelectItem value={value} key={value}>{label}</SelectItem>)}</SelectContent></Select><Button onClick={send} disabled={busy}><Send data-icon="inline-start" aria-hidden="true"/>{busy?text.sending:text.send}</Button></div>{error&&<Alert variant="destructive"><CircleAlert aria-hidden="true"/><AlertTitle>{text.failed}</AlertTitle></Alert>}{result&&<Alert><CheckCircle2 aria-hidden="true"/><AlertTitle>{text.result}: {result.status.replaceAll("_"," ")}</AlertTitle><AlertDescription>{result.requestedChannel} → {result.deliveredChannel??"—"} · {result.deliveryReason.replaceAll("_"," ")}</AlertDescription></Alert>}</section>;
}
