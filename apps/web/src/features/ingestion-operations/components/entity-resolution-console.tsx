"use client";

import type {
  EntityResolutionQueueResponse,
  EntityResolutionStatus,
  EntityResolutionWorkItem,
} from "@rama/contracts";
import {
  AlertTriangle,
  ArrowLeft,
  Braces,
  Check,
  Clock3,
  Database,
  FileKey,
  Fingerprint,
  History,
  Languages,
  Link2,
  RefreshCcw,
  ShieldAlert,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n";

type Props = { initialQueue: EntityResolutionQueueResponse; locale: Locale };
type Filter = EntityResolutionStatus | "all";
type Decision = "matched" | "conflict" | "rejected";

const statuses: EntityResolutionStatus[] = ["pending", "conflict", "matched", "rejected"];
const operationsApiUrl = "/api/operations";

const text = {
  en: {
    workspace: "OPERATIONS WORKSPACE",
    title: "Entity resolution",
    property: "View property",
    evidence: "Evidence operations",
    eyebrow: "RAMA / INGESTION CONTROL",
    headline: "Resolve every identity before trust moves forward.",
    intro: "Compare the partner identity, submitted property and immutable source record. Every decision is versioned and auditable.",
    generated: "Queue generated",
    summary: "Resolution queue summary",
    all: "All items",
    queue: "Partner identities",
    review: "Resolution review",
    empty: "No identities in this state.",
    select: "Select an identity to review.",
    source: "Source",
    externalId: "External ID",
    submittedProperty: "Submitted property",
    canonicalProperty: "Canonical property slug",
    claim: "Claim key",
    evidenceClass: "Evidence class",
    recordState: "Raw record state",
    retrieved: "Retrieved",
    received: "Received",
    artifact: "Immutable artifact",
    payloadHash: "Payload SHA-256",
    artifactHash: "Artifact SHA-256",
    payload: "Source payload",
    decision: "Resolution decision",
    reason: "Decision reason",
    reasonHelp: "Give the next reviewer enough context to reproduce this decision.",
    reasonPlaceholder: "Explain the identity evidence and decision…",
    match: "Match property",
    conflict: "Mark conflict",
    reject: "Reject identity",
    terminal: "This item is terminal. Its decision remains visible in the audit trail.",
    saved: "Decision saved to the append-only audit trail.",
    audit: "Audit trail",
    refresh: "Refresh queue",
    canonicalHelp: "Use an existing RAMA property slug. Matching validates it against the property catalogue.",
  },
  ar: {
    workspace: "مساحة العمليات",
    title: "مطابقة الكيانات",
    property: "عرض العقار",
    evidence: "عمليات الأدلة",
    eyebrow: "راما / ضبط الاستيعاب",
    headline: "طابق كل هوية قبل انتقال الثقة إلى الأمام.",
    intro: "قارن هوية الشريك والعقار المرسل والسجل الخام غير القابل للتغيير. كل قرار مؤرشف بإصدار وقابل للتدقيق.",
    generated: "تاريخ إنشاء القائمة",
    summary: "ملخص قائمة المطابقة",
    all: "كل العناصر",
    queue: "هويات الشركاء",
    review: "مراجعة المطابقة",
    empty: "لا توجد هويات بهذه الحالة.",
    select: "اختر هوية لمراجعتها.",
    source: "المصدر",
    externalId: "المعرّف الخارجي",
    submittedProperty: "العقار المرسل",
    canonicalProperty: "المعرّف القياسي للعقار",
    claim: "مفتاح المطالبة",
    evidenceClass: "فئة الدليل",
    recordState: "حالة السجل الخام",
    retrieved: "تاريخ الاسترجاع",
    received: "تاريخ الاستلام",
    artifact: "المستند غير القابل للتغيير",
    payloadHash: "بصمة الحمولة SHA-256",
    artifactHash: "بصمة المستند SHA-256",
    payload: "حمولة المصدر",
    decision: "قرار المطابقة",
    reason: "سبب القرار",
    reasonHelp: "امنح المراجع التالي سياقاً كافياً لإعادة التحقق من القرار.",
    reasonPlaceholder: "اشرح دليل الهوية والقرار…",
    match: "مطابقة العقار",
    conflict: "تسجيل تعارض",
    reject: "رفض الهوية",
    terminal: "هذا العنصر نهائي. يبقى القرار ظاهراً في سجل التدقيق.",
    saved: "تم حفظ القرار في سجل التدقيق المتسلسل.",
    audit: "سجل التدقيق",
    refresh: "تحديث القائمة",
    canonicalHelp: "استخدم معرّف عقار موجوداً في راما. تتحقق المطابقة منه في فهرس العقارات.",
  },
} as const;

const statusText = {
  en: { pending: "Pending", conflict: "Conflict", matched: "Matched", rejected: "Rejected" },
  ar: { pending: "قيد الانتظار", conflict: "تعارض", matched: "تمت المطابقة", rejected: "مرفوض" },
} as const;

export function replaceResolutionItem(
  queue: EntityResolutionQueueResponse,
  next: EntityResolutionWorkItem,
): EntityResolutionQueueResponse {
  const previous = queue.items.find((item) => item.id === next.id);
  const counts = { ...queue.counts };
  if (previous && previous.status !== next.status) {
    counts[previous.status] -= 1;
    counts[next.status] += 1;
  }
  return {
    ...queue,
    items: queue.items.map((item) => (item.id === next.id ? next : item)),
    counts,
    generatedAt: new Date().toISOString(),
  };
}

const shortHash = (value: string): string => `${value.slice(0, 12)}…${value.slice(-10)}`;

export function EntityResolutionConsole({ initialQueue, locale }: Props) {
  const copy = text[locale];
  const [queue, setQueue] = useState(initialQueue);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState(
    initialQueue.items.find((item) => item.status === "conflict")?.id ??
      initialQueue.items.find((item) => item.status === "pending")?.id ??
      initialQueue.items[0]?.id ??
      "",
  );
  const [canonicalSlug, setCanonicalSlug] = useState("residence-1204");
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState<Decision | "refresh" | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; value: string } | null>(null);

  const items = useMemo(
    () => queue.items.filter((item) => filter === "all" || item.status === filter),
    [filter, queue.items],
  );
  const selected = queue.items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const terminal = selected ? ["matched", "rejected"].includes(selected.status) : false;

  async function refresh(): Promise<void> {
    setPending("refresh");
    setMessage(null);
    try {
      const response = await fetch(`${operationsApiUrl}/ingestion/resolution-queue`, {
        cache: "no-store",
      });
      if (!response.ok) throw new Error(`Queue refresh failed (${response.status}).`);
      setQueue((await response.json()) as EntityResolutionQueueResponse);
    } catch (error) {
      setMessage({ kind: "error", value: error instanceof Error ? error.message : "Unknown error." });
    } finally {
      setPending(null);
    }
  }

  async function decide(decision: Decision): Promise<void> {
    if (!selected) return;
    if (reason.trim().length < 4) {
      setMessage({
        kind: "error",
        value: locale === "ar" ? "اكتب سبباً واضحاً من أربعة أحرف على الأقل." : "Enter a clear reason of at least four characters.",
      });
      return;
    }
    if (decision === "matched" && canonicalSlug.trim().length < 2) {
      setMessage({ kind: "error", value: locale === "ar" ? "أدخل معرّف العقار القياسي." : "Enter a canonical property slug." });
      return;
    }
    setPending(decision);
    setMessage(null);
    try {
      const response = await fetch(`${operationsApiUrl}/ingestion/resolution-queue/${selected.id}/resolve`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          expectedVersion: selected.version,
          decision,
          canonicalPropertySlug: decision === "matched" ? canonicalSlug.trim() : null,
          reason: reason.trim(),
        }),
      });
      const body = (await response.json()) as EntityResolutionWorkItem & { message?: string | string[] };
      if (!response.ok) {
        throw new Error(Array.isArray(body.message) ? body.message.join(" ") : body.message ?? `Decision failed (${response.status}).`);
      }
      setQueue((current) => replaceResolutionItem(current, body));
      setReason("");
      setMessage({ kind: "success", value: copy.saved });
    } catch (error) {
      setMessage({ kind: "error", value: error instanceof Error ? error.message : "Unknown error." });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="operationsApp resolutionApp" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <a className="skipLink" href="#resolution-main">
        {locale === "ar" ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>
      <header className="operationsHeader">
        <div className="operationsHeaderInner">
          <a className="brand" href={`/${locale}/properties/residence-1204`} aria-label="RAMA">
            <span className="brandMark" aria-hidden="true">R</span><span>RAMA</span>
          </a>
          <div className="operationsTitle"><span>{copy.workspace}</span><strong>{copy.title}</strong></div>
          <nav aria-label={locale === "ar" ? "تنقل العمليات" : "Operations navigation"}>
            <a href={`/${locale}/operations/evidence`}><Database aria-hidden="true" />{copy.evidence}</a>
            <a href={`/${locale}/properties/residence-1204`}><ArrowLeft aria-hidden="true" />{copy.property}</a>
            <a href={`/${locale === "en" ? "ar" : "en"}/operations/resolution`}><Languages aria-hidden="true" />{locale === "ar" ? "English" : "العربية"}</a>
          </nav>
        </div>
      </header>

      <main className="operationsFrame" id="resolution-main">
        <section className="operationsIntro resolutionIntro" aria-labelledby="resolution-title">
          <div><p className="eyebrow">{copy.eyebrow}</p><h1 id="resolution-title">{copy.headline}</h1></div>
          <div><p>{copy.intro}</p><span><Clock3 aria-hidden="true" />{copy.generated} {formatDate(queue.generatedAt, locale)}</span></div>
        </section>

        <section className="queueMetrics resolutionMetrics" aria-label={copy.summary}>
          <Button aria-pressed={filter === "all"} className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button"><span>{copy.all}</span><strong>{queue.items.length}</strong></Button>
          {statuses.map((status) => <Button aria-pressed={filter === status} className={`${filter === status ? "active " : ""}status-${status}`} key={status} onClick={() => setFilter(status)} type="button"><span>{statusText[locale][status]}</span><strong>{queue.counts[status]}</strong></Button>)}
        </section>

        <div className="operationsLayout resolutionLayout">
          <section className="queuePanel" aria-labelledby="resolution-queue-heading">
            <div className="panelHeading"><div><p className="eyebrow">01 / QUEUE</p><h2 id="resolution-queue-heading">{copy.queue}</h2></div><Button aria-label={copy.refresh} disabled={pending === "refresh"} onClick={() => void refresh()} size="icon" title={copy.refresh} type="button" variant="outline"><RefreshCcw aria-hidden="true" /></Button></div>
            <div className="queueList resolutionQueueList">
              {items.map((item) => (
                <Button aria-pressed={selected?.id === item.id} className={`queueItem resolutionQueueItem ${selected?.id === item.id ? "selected" : ""}`} key={item.id} onClick={() => { setSelectedId(item.id); setCanonicalSlug(item.canonicalPropertySlug ?? item.submittedPropertySlug); setMessage(null); }} type="button" variant="ghost">
                  <span className={`workflowDot ${item.status}`} aria-hidden="true" />
                  <span className="queueItemIdentity"><strong>{item.externalEntityId}</strong><small>{item.rawRecord.claimKey.replaceAll("_", " ")} · v{item.version}</small></span>
                  <Badge className={`workflowBadge ${item.status}`} variant="outline">{statusText[locale][item.status]}</Badge>
                  <span className="queueItemDate">{formatDate(item.updatedAt, locale)}</span>
                </Button>
              ))}
              {!items.length ? <p className="emptyQueue">{copy.empty}</p> : null}
            </div>
          </section>

          <section className="workPanel resolutionWorkPanel" aria-labelledby="resolution-work-heading">
            {selected ? <>
              <div className="panelHeading"><div><p className="eyebrow">02 / REVIEW</p><h2 id="resolution-work-heading">{copy.review} · {selected.externalEntityId}</h2></div><Badge className={`workflowBadge ${selected.status}`} variant="outline">{statusText[locale][selected.status]}</Badge></div>

              <div className="workSummary resolutionSummary">
                <div><span>{copy.source}</span><strong>{selected.sourceKey}</strong></div>
                <div><span>{copy.submittedProperty}</span><strong>{selected.submittedPropertySlug}</strong></div>
                <div><span>{copy.recordState}</span><strong>{selected.rawRecord.status}</strong></div>
              </div>

              <div className="resolutionDetails">
                <Card className="identityCard">
                  <CardHeader><CardTitle><Fingerprint aria-hidden="true" />{locale === "ar" ? "هوية الشريك" : "Partner identity"}</CardTitle></CardHeader>
                  <CardContent><dl>
                    <div><dt>{copy.externalId}</dt><dd>{selected.externalEntityId}</dd></div>
                    <div><dt>{copy.claim}</dt><dd>{selected.rawRecord.claimKey}</dd></div>
                    <div><dt>{copy.evidenceClass}</dt><dd>{selected.rawRecord.evidenceClass.replaceAll("_", " ")}</dd></div>
                    <div><dt>{copy.retrieved}</dt><dd>{formatDate(selected.rawRecord.retrievedAt, locale)}</dd></div>
                    <div><dt>{copy.received}</dt><dd>{formatDate(selected.rawRecord.receivedAt, locale)}</dd></div>
                  </dl></CardContent>
                </Card>
                <Card className="identityCard">
                  <CardHeader><CardTitle><FileKey aria-hidden="true" />{copy.artifact}</CardTitle></CardHeader>
                  <CardContent><dl>
                    <div className="wide"><dt>{copy.artifact}</dt><dd>{selected.rawRecord.artifact.objectKey}</dd></div>
                    <div><dt>{copy.payloadHash}</dt><dd><code title={selected.rawRecord.payloadSha256}>{shortHash(selected.rawRecord.payloadSha256)}</code></dd></div>
                    <div><dt>{copy.artifactHash}</dt><dd><code title={selected.rawRecord.artifact.sha256}>{shortHash(selected.rawRecord.artifact.sha256)}</code></dd></div>
                  </dl></CardContent>
                </Card>
              </div>

              <div className="payloadBlock"><h3><Braces aria-hidden="true" />{copy.payload}</h3><pre dir="ltr">{JSON.stringify(selected.rawRecord.payload, null, 2)}</pre></div>

              {message ? <Alert className={`operationMessage ${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.kind === "success" ? <Check aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}<AlertDescription>{message.value}</AlertDescription></Alert> : null}

              <div className="resolutionDecision">
                <div className="resolutionDecisionHeading"><Link2 aria-hidden="true" /><div><h3>{copy.decision}</h3><p>{copy.reasonHelp}</p></div></div>
                {terminal ? <Alert className="terminalNotice"><ShieldAlert aria-hidden="true" /><AlertDescription>{copy.terminal}</AlertDescription></Alert> : <>
                  <div className="decisionFields">
                    <label htmlFor="canonical-slug"><span>{copy.canonicalProperty}</span><Input autoComplete="off" id="canonical-slug" onChange={(event) => setCanonicalSlug(event.target.value)} value={canonicalSlug} /><small id="canonical-help">{copy.canonicalHelp}</small></label>
                    <label htmlFor="decision-reason"><span>{copy.reason}</span><Textarea id="decision-reason" onChange={(event) => setReason(event.target.value)} placeholder={copy.reasonPlaceholder} value={reason} /></label>
                  </div>
                  <div className="operationButtons resolutionButtons">
                    <Button disabled={Boolean(pending)} onClick={() => void decide("matched")} type="button"><Check aria-hidden="true" />{copy.match}</Button>
                    <Button disabled={Boolean(pending)} onClick={() => void decide("conflict")} type="button" variant="outline"><AlertTriangle aria-hidden="true" />{copy.conflict}</Button>
                    <Button disabled={Boolean(pending)} onClick={() => void decide("rejected")} type="button" variant="destructive"><X aria-hidden="true" />{copy.reject}</Button>
                  </div>
                </>}
              </div>

              <div className="auditSection"><h3><History aria-hidden="true" />{copy.audit}</h3><ol>{[...selected.auditTrail].reverse().map((event) => <li key={event.id}><span className={`workflowDot ${event.toStatus}`} aria-hidden="true" /><div><strong>{event.action.replaceAll("_", " ")}</strong><small>{event.actorId} · {formatDate(event.createdAt, locale)} · v{event.version}</small><p>{event.reason}</p></div></li>)}</ol></div>
            </> : <div className="emptyWork"><Fingerprint aria-hidden="true" /><p>{copy.select}</p></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
