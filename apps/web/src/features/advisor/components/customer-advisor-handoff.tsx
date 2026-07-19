"use client";

import {
  AdvisorConsentWithdrawalResponseSchema,
  DecisionCaseSchema,
  HouseholdBriefSchema,
  type CatalogueSearchResponse,
  type DecisionCase,
  type DecisionCaseListResponse,
  type HouseholdBrief,
  type HouseholdBriefListResponse,
  type PropertyShortlist,
} from "@rama/contracts";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleAlert, Clock3, LockKeyhole, MessageSquareText, Send, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Locale } from "@/lib/i18n";

type Props = { briefs: HouseholdBriefListResponse; catalogue: CatalogueSearchResponse; cases: DecisionCaseListResponse; locale: Locale; shortlist: PropertyShortlist | null };
type Notice = { kind: "error" | "success"; text: string } | null;

const copy = {
  en: {
    skip: "Skip to advisor handoff", brand: "RAMA", secure: "Protected advisor handoff", language: "العربية", discover: "Discover",
    title: "Move from comparison to an accountable next step.", intro: "Choose the properties and structured topics an advisor should review. RAMA records consent, the exact brief and shortlist versions, and a four-hour response SLA.",
    privacy: "No raw sensitive text is collected here. Contact details stay in the protected identity profile.", noBrief: "A submitted household brief is required.", noBriefHelp: "Complete and submit your brief before requesting an advisor.", openBrief: "Open household brief",
    noShortlist: "Save at least one property before handoff.", noShortlistHelp: "The advisor receives only properties from your current saved shortlist.", openDiscover: "Open discovery",
    existing: "Active advisor case", requested: "Requested", assigned: "Advisor assigned", cancelled: "Cancelled", closed: "Closed", due: "Response due", assignedTo: "Assigned advisor", audit: "Versioned activity", cancel: "Cancel request", cancelling: "Cancelling…",
    formTitle: "Prepare the handoff", formHelp: "Select 1–4 shortlisted properties and the topics that need a documented response.", properties: "Properties to review", reason: "Primary reason", channel: "Preferred contact channel", topics: "Topics for the advisor",
    reasons: { property_questions: "Property questions", financing_readiness: "Financing readiness", viewing_request: "Viewing request", accessibility_review: "Accessibility review" },
    channels: { in_app: "In-app", phone: "Phone from profile", email: "Email from profile" },
    topicLabels: { evidence_unknowns: "Evidence unknowns", total_costs: "Total costs", financing_next_steps: "Financing next steps", property_access: "Property access", viewing_coordination: "Viewing coordination" },
    consent: "I allow RAMA and an assigned advisor to contact me about this handoff.", consentHelp: "This optional consent is versioned on your household brief. You can later cancel the case or change the preference.", retention: "Case metadata is retained for 180 days under", submit: "Request advisor", submitting: "Requesting…", success: "Advisor request created with a four-hour response SLA.", failed: "The handoff could not be created. Refresh if the brief or shortlist changed.", selectProperty: "Select at least one property.", selectTopic: "Select at least one topic.", consentRequired: "Advisor-contact consent is required for this handoff.",
  },
  ar: {
    skip: "الانتقال إلى تسليم المستشار", brand: "راما", secure: "تسليم محمي للمستشار", language: "English", discover: "اكتشف",
    title: "انتقل من المقارنة إلى خطوة تالية خاضعة للمساءلة.", intro: "اختر العقارات والموضوعات المنظمة التي ينبغي للمستشار مراجعتها. تسجل راما الموافقة وإصداري الملخص والقائمة ومدة استجابة أربع ساعات.",
    privacy: "لا نجمع نصاً حساساً حراً هنا. تبقى بيانات الاتصال في ملف الهوية المحمي.", noBrief: "يلزم ملخص أسري مُرسل.", noBriefHelp: "أكمل الملخص وأرسله قبل طلب مستشار.", openBrief: "فتح ملخص الأسرة",
    noShortlist: "احفظ عقاراً واحداً على الأقل قبل التسليم.", noShortlistHelp: "يتلقى المستشار العقارات الموجودة في قائمتك المحفوظة الحالية فقط.", openDiscover: "فتح الاكتشاف",
    existing: "حالة مستشار نشطة", requested: "تم الطلب", assigned: "تم تعيين مستشار", cancelled: "ملغاة", closed: "مغلقة", due: "موعد الاستجابة", assignedTo: "المستشار المعين", audit: "نشاط محفوظ بالإصدارات", cancel: "إلغاء الطلب", cancelling: "جارٍ الإلغاء…",
    formTitle: "جهّز التسليم", formHelp: "اختر من عقار إلى أربعة عقارات محفوظة والموضوعات التي تحتاج إلى رد موثق.", properties: "العقارات للمراجعة", reason: "السبب الرئيسي", channel: "قناة الاتصال المفضلة", topics: "موضوعات المستشار",
    reasons: { property_questions: "أسئلة العقار", financing_readiness: "الجاهزية التمويلية", viewing_request: "طلب معاينة", accessibility_review: "مراجعة سهولة الوصول" },
    channels: { in_app: "داخل التطبيق", phone: "هاتف من الملف", email: "بريد من الملف" },
    topicLabels: { evidence_unknowns: "الأدلة المجهولة", total_costs: "إجمالي التكاليف", financing_next_steps: "خطوات التمويل التالية", property_access: "الوصول إلى العقار", viewing_coordination: "تنسيق المعاينة" },
    consent: "أسمح لراما ولمستشار معيّن بالتواصل معي بشأن هذا التسليم.", consentHelp: "تُحفظ هذه الموافقة الاختيارية كإصدار في ملخص الأسرة. يمكنك لاحقاً إلغاء الحالة أو تغيير التفضيل.", retention: "تُحتفظ بيانات الحالة لمدة 180 يوماً وفق", submit: "طلب مستشار", submitting: "جارٍ الطلب…", success: "تم إنشاء طلب المستشار بمدة استجابة أربع ساعات.", failed: "تعذر إنشاء التسليم. حدّث الصفحة إذا تغير الملخص أو القائمة.", selectProperty: "اختر عقاراً واحداً على الأقل.", selectTopic: "اختر موضوعاً واحداً على الأقل.", consentRequired: "موافقة تواصل المستشار مطلوبة لهذا التسليم.",
  },
} as const;

const topics = ["evidence_unknowns", "total_costs", "financing_next_steps", "property_access", "viewing_coordination"] as const;

export function CustomerAdvisorHandoff({ briefs, catalogue, cases, locale, shortlist }: Props) {
  const t = copy[locale]; const rtl = locale === "ar"; const Back = rtl ? ArrowRight : ArrowLeft;
  const privacy = locale === "ar" ? {
    title: "تفضيل تواصل المستشار", help: "يمكنك سحب الموافقة في أي وقت. يتوقف وصول المستشار فوراً وتُلغى أي حالة نشطة.", action: "سحب الموافقة", busy: "جارٍ سحب الموافقة…", success: "تم سحب موافقة تواصل المستشار وإلغاء أي حالة نشطة.",
  } : {
    title: "Advisor contact preference", help: "You can withdraw at any time. Advisor access stops immediately and any active case is cancelled.", action: "Withdraw consent", busy: "Withdrawing consent…", success: "Advisor-contact consent was withdrawn and any active case was cancelled.",
  };
  const submitted = briefs.items.find((brief) => brief.status === "submitted") ?? null;
  const [brief, setBrief] = useState<HouseholdBrief | null>(submitted);
  const [decisionCase, setDecisionCase] = useState<DecisionCase | null>(cases.items.find((item) => item.status === "requested" || item.status === "assigned") ?? null);
  const [selected, setSelected] = useState<string[]>(() => shortlist?.propertySlugs.slice(0,4) ?? []);
  const [reason, setReason] = useState<keyof typeof t.reasons>("property_questions");
  const [channel, setChannel] = useState<keyof typeof t.channels>("in_app");
  const [selectedTopics, setSelectedTopics] = useState<Array<(typeof topics)[number]>>(["evidence_unknowns"]);
  const [contactConsent, setContactConsent] = useState(brief?.input.consent.advisorContactAllowed ?? false);
  const [busy, setBusy] = useState<"create"|"cancel"|"withdraw"|null>(null); const [notice, setNotice] = useState<Notice>(null);
  const records = new Map(catalogue.items.map((item) => [item.slug,item]));

  const toggle = <T extends string>(values: T[], value: T, checked: boolean, set: (next:T[])=>void) => set(checked ? [...values,value] : values.filter((item)=>item!==value));
  const create = async () => {
    if (!brief || !shortlist) return; setNotice(null);
    if (!selected.length) { setNotice({kind:"error",text:t.selectProperty}); return; }
    if (!selectedTopics.length) { setNotice({kind:"error",text:t.selectTopic}); return; }
    if (!contactConsent) { setNotice({kind:"error",text:t.consentRequired}); return; }
    setBusy("create");
    try {
      let currentBrief = brief;
      if (!brief.input.consent.advisorContactAllowed) {
        const consentResponse = await fetch(`/api/customer/briefs/${brief.id}/consent`, { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ expectedVersion:brief.version, advisorContactAllowed:true, anonymousAnalyticsAllowed:brief.input.consent.anonymousAnalyticsAllowed, reason:"advisor_handoff" }) });
        if (!consentResponse.ok) throw new Error(String(consentResponse.status));
        currentBrief = HouseholdBriefSchema.parse(await consentResponse.json()); setBrief(currentBrief);
      }
      const response = await fetch("/api/customer/decision-cases", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ briefId:currentBrief.id, shortlistVersion:shortlist.version, propertySlugs:selected, reason, topics:selectedTopics, preferredContactChannel:channel }) });
      if (!response.ok) throw new Error(String(response.status));
      setDecisionCase(DecisionCaseSchema.parse(await response.json())); setNotice({kind:"success",text:t.success});
    } catch { setNotice({kind:"error",text:t.failed}); } finally { setBusy(null); }
  };
  const cancel = async () => {
    if (!decisionCase) return; setBusy("cancel"); setNotice(null);
    try { const response=await fetch(`/api/customer/decision-cases/${decisionCase.id}/cancel`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({expectedVersion:decisionCase.version,reason:"changed_mind"})}); if(!response.ok)throw new Error(String(response.status)); DecisionCaseSchema.parse(await response.json()); setDecisionCase(null); setNotice({kind:"success",text:t.cancelled}); }
    catch { setNotice({kind:"error",text:t.failed}); } finally { setBusy(null); }
  };
  const withdraw = async () => {
    if (!brief) return; setBusy("withdraw"); setNotice(null);
    try {
      const response = await fetch("/api/customer/privacy/advisor-consent/withdraw", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ briefId:brief.id, expectedBriefVersion:brief.version, anonymousAnalyticsAllowed:brief.input.consent.anonymousAnalyticsAllowed }) });
      if (!response.ok) throw new Error(String(response.status));
      const result = AdvisorConsentWithdrawalResponseSchema.parse(await response.json());
      setBrief(result.brief); setDecisionCase(null); setContactConsent(false); setNotice({kind:"success",text:privacy.success});
    } catch { setNotice({kind:"error",text:t.failed}); } finally { setBusy(null); }
  };

  return <div className="handoffApp" dir={rtl?"rtl":"ltr"} lang={locale}><a className="skipLink" href="#handoff-main">{t.skip}</a><header className="handoffHeader"><div className="handoffHeaderInner"><a className="brand" href={`/${locale}/discover`}><span className="brandMark" aria-hidden="true">R</span>{t.brand}</a><span><LockKeyhole aria-hidden="true" />{t.secure}</span><nav><a href={`/${locale}/discover`}>{t.discover}</a><a href={`/${locale==="en"?"ar":"en"}/advisor`} lang={locale==="en"?"ar":"en"}>{t.language}</a></nav></div></header><main className="handoffFrame" id="handoff-main"><section className="handoffIntro"><div><p className="eyebrow">RAMA / ADVISOR HANDOFF</p><h1>{t.title}</h1></div><div><p>{t.intro}</p><span><ShieldCheck aria-hidden="true" />{t.privacy}</span></div></section>
    {notice&&<Alert className="handoffNotice" variant={notice.kind==="error"?"destructive":"default"}><CircleAlert aria-hidden="true" /><AlertTitle>{notice.kind==="error"?t.failed:notice.text}</AlertTitle><AlertDescription>{notice.text}</AlertDescription></Alert>}
    {brief?.input.consent.advisorContactAllowed && <Card className="privacyPreference"><CardHeader><ShieldCheck aria-hidden="true" /><CardTitle><h2>{privacy.title}</h2></CardTitle><CardDescription>{privacy.help}</CardDescription></CardHeader><CardContent><Button variant="outline" onClick={withdraw} disabled={busy!==null}><X data-icon="inline-start" aria-hidden="true" />{busy==="withdraw"?privacy.busy:privacy.action}</Button></CardContent></Card>}
    {!brief && <RequirementAlert title={t.noBrief} help={t.noBriefHelp} href={`/${locale}/brief`} action={t.openBrief} />}
    {brief && (!shortlist || shortlist.propertySlugs.length===0) && <RequirementAlert title={t.noShortlist} help={t.noShortlistHelp} href={`/${locale}/discover`} action={t.openDiscover} />}
    {brief && shortlist && shortlist.propertySlugs.length>0 && decisionCase && <CaseStatus decisionCase={decisionCase} locale={locale} text={t} onCancel={cancel} cancelling={busy==="cancel"} />}
    {brief && shortlist && shortlist.propertySlugs.length>0 && !decisionCase && <Card className="handoffForm"><CardHeader><MessageSquareText aria-hidden="true" /><CardTitle><h2>{t.formTitle}</h2></CardTitle><CardDescription>{t.formHelp}</CardDescription></CardHeader><CardContent>
      <fieldset className="handoffChoices"><legend>{t.properties}</legend>{shortlist.propertySlugs.map((slug)=><label key={slug} htmlFor={`handoff-${slug}`}><Checkbox id={`handoff-${slug}`} checked={selected.includes(slug)} onCheckedChange={(checked)=>toggle(selected,slug,checked,setSelected)} /><span><strong>{records.get(slug)?.name[locale]??slug}</strong><small>{records.get(slug)?.community[locale]??slug}</small></span></label>)}</fieldset>
      <div className="handoffFields"><SelectField id="handoff-reason" label={t.reason} value={reason} options={t.reasons} onChange={(value)=>setReason(value as typeof reason)} /><SelectField id="handoff-channel" label={t.channel} value={channel} options={t.channels} onChange={(value)=>setChannel(value as typeof channel)} /></div>
      <fieldset className="handoffChoices"><legend>{t.topics}</legend>{topics.map((topic)=><label key={topic} htmlFor={`topic-${topic}`}><Checkbox id={`topic-${topic}`} checked={selectedTopics.includes(topic)} onCheckedChange={(checked)=>toggle(selectedTopics,topic,checked,setSelectedTopics)} /><span><strong>{t.topicLabels[topic]}</strong></span></label>)}</fieldset>
      <div className="handoffConsent"><label htmlFor="advisor-consent"><Checkbox id="advisor-consent" checked={contactConsent} onCheckedChange={setContactConsent} /><span>{t.consent}</span></label><p>{t.consentHelp}</p></div><p className="handoffRetention"><LockKeyhole aria-hidden="true" />{t.retention} <code>rama.customer-handoff.phase1.v1</code>.</p>
      <Button size="lg" onClick={create} disabled={busy!==null}><Send data-icon="inline-start" aria-hidden="true" />{busy==="create"?t.submitting:t.submit}</Button>
    </CardContent></Card>}
    <div className="handoffLinks"><a className="handoffBack" href={`/${locale}/discover`}><Back aria-hidden="true" />{t.discover}</a><a className="handoffBack" href={`/${locale}/settings/contact`}><LockKeyhole aria-hidden="true" />{locale==="ar"?"إعدادات الاتصال":"Contact settings"}</a><a className="handoffBack" href={`/${locale}/notifications`}><MessageSquareText aria-hidden="true" />{locale==="ar"?"الإشعارات":"Notifications"}</a></div>
  </main></div>;
}

type Text = typeof copy.en | typeof copy.ar;
function RequirementAlert({title,help,href,action}:{title:string;help:string;href:string;action:string}){return <Alert className="handoffRequirement"><CircleAlert aria-hidden="true" /><AlertTitle>{title}</AlertTitle><AlertDescription><span>{help}</span><a href={href}>{action}</a></AlertDescription></Alert>}
function SelectField({id,label,value,options,onChange}:{id:string;label:string;value:string;options:Record<string,string>;onChange:(value:string)=>void}){return <div className="handoffField"><span id={`${id}-label`}>{label}</span><Select value={value} onValueChange={(next)=>next&&onChange(String(next))}><SelectTrigger id={id} aria-labelledby={`${id}-label ${id}`}><SelectValue>{options[value]??value}</SelectValue></SelectTrigger><SelectContent>{Object.entries(options).map(([key,text])=><SelectItem key={key} value={key}>{text}</SelectItem>)}</SelectContent></Select></div>}
function CaseStatus({decisionCase,locale,text:t,onCancel,cancelling}:{decisionCase:DecisionCase;locale:Locale;text:Text;onCancel:()=>void;cancelling:boolean}){const active=decisionCase.status==="requested"||decisionCase.status==="assigned";return <Card className="caseStatus"><CardHeader><CheckCircle2 aria-hidden="true" /><CardTitle><h2>{t.existing}</h2></CardTitle><Badge variant={decisionCase.status==="assigned"?"secondary":"outline"}>{decisionCase.status==="requested"?t.requested:decisionCase.status==="assigned"?t.assigned:decisionCase.status==="cancelled"?t.cancelled:t.closed}</Badge></CardHeader><CardContent><dl><div><dt>{t.due}</dt><dd><Clock3 aria-hidden="true" />{new Intl.DateTimeFormat(locale==="ar"?"ar-AE":"en-AE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(decisionCase.responseDueAt))}</dd></div><div><dt>{t.assignedTo}</dt><dd>{decisionCase.advisorId??"—"}</dd></div><div><dt>{t.audit}</dt><dd>{decisionCase.auditTrail.length} · v{decisionCase.version}</dd></div></dl><ol>{decisionCase.auditTrail.map((event)=><li key={event.id}><strong>{event.action}</strong><span>{new Intl.DateTimeFormat(locale==="ar"?"ar-AE":"en-AE",{dateStyle:"medium",timeStyle:"short"}).format(new Date(event.createdAt))}</span></li>)}</ol>{active&&<Button variant="destructive" onClick={onCancel} disabled={cancelling}><X data-icon="inline-start" aria-hidden="true" />{cancelling?t.cancelling:t.cancel}</Button>}</CardContent></Card>}
