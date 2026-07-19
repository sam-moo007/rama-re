"use client";

import type {
  EvidenceQueueResponse,
  EvidenceWorkflowStatus,
} from "@rama/contracts";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CircleAlert,
  Clock3,
  FileClock,
  FileSearch,
  History,
  Network,
  Languages,
  RefreshCcw,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import { localize, type Locale } from "@/lib/i18n";

type EvidenceOperationsConsoleProps = {
  initialQueue: EvidenceQueueResponse;
  locale: Locale;
};

const statuses: EvidenceWorkflowStatus[] = [
  "draft",
  "in_review",
  "approved",
  "published",
  "expired",
  "superseded",
];

const statusCopy = {
  en: { draft: "Draft", in_review: "In review", approved: "Approved", published: "Published", expired: "Expired", superseded: "Superseded" },
  ar: { draft: "مسودة", in_review: "قيد المراجعة", approved: "معتمد", published: "منشور", expired: "منتهي", superseded: "تم استبداله" },
} as const;

const operationsApiUrl = "/api/operations";

export function EvidenceOperationsConsole({ initialQueue, locale }: EvidenceOperationsConsoleProps) {
  const [queue, setQueue] = useState(initialQueue);
  const [filter, setFilter] = useState<EvidenceWorkflowStatus | "all">("all");
  const [selectedId, setSelectedId] = useState(
    initialQueue.items.find((item) => item.workflowStatus === "in_review")?.id ?? initialQueue.items[0]?.id ?? "",
  );
  const [reviewReason, setReviewReason] = useState("Evidence source and method reviewed against the current artifact.");
  const [correctionReason, setCorrectionReason] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const items = useMemo(
    () => queue.items.filter((item) => filter === "all" || item.workflowStatus === filter),
    [filter, queue.items],
  );
  const selected = queue.items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  async function refreshQueue(): Promise<void> {
    const response = await fetch(`${operationsApiUrl}/evidence/queue`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Queue refresh failed (${response.status}).`);
    setQueue((await response.json()) as EvidenceQueueResponse);
  }

  async function perform(action: string, body: Record<string, unknown>): Promise<void> {
    if (!selected) return;
    setPending(action);
    setMessage(null);
    try {
      const response = await fetch(`${operationsApiUrl}/evidence/${selected.id}/${action}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ expectedVersion: selected.version, ...body }),
      });
      if (!response.ok) {
        const problem = (await response.json()) as { message?: string | string[] };
        throw new Error(Array.isArray(problem.message) ? problem.message.join(" ") : problem.message ?? `Operation failed (${response.status}).`);
      }
      await refreshQueue();
      setMessage({ kind: "success", text: locale === "ar" ? "تم حفظ الانتقال في سجل التدقيق." : "Transition saved to the audit trail." });
      setCorrectionReason("");
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unknown operation error." });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="operationsApp" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <header className="operationsHeader">
        <div className="operationsHeaderInner">
          <a className="brand" href={`/${locale}/properties/residence-1204`}><span className="brandMark">R</span><span>RAMA</span></a>
          <div className="operationsTitle"><span>{locale === "ar" ? "مساحة العمل" : "OPERATIONS WORKSPACE"}</span><strong>{locale === "ar" ? "الأدلة والثقة" : "Evidence + trust"}</strong></div>
          <nav>
            <a href={`/${locale}/operations/resolution`}><Network aria-hidden="true" size={16} />{locale === "ar" ? "مطابقة الكيانات" : "Entity resolution"}</a>
            <a href={`/${locale}/properties/residence-1204`}><ArrowLeft aria-hidden="true" size={16} />{locale === "ar" ? "عرض العقار" : "View property"}</a>
            <a href={`/${locale === "en" ? "ar" : "en"}/operations/evidence`}><Languages aria-hidden="true" size={16} />{locale === "ar" ? "English" : "العربية"}</a>
          </nav>
        </div>
      </header>

      <main className="operationsFrame">
        <section className="operationsIntro">
          <div><p className="eyebrow">RAMA / EVIDENCE OPERATIONS</p><h1>{locale === "ar" ? "اجعل حالة الثقة قابلة للتشغيل." : "Make trust operable."}</h1></div>
          <div><p>{locale === "ar" ? "راجع كل مطالبة وانشرها أو أنشئ طلب تصحيح من دون حذف تاريخها." : "Review, publish, expire or challenge every claim without deleting its history."}</p><span><Clock3 aria-hidden="true" size={15} />{locale === "ar" ? "تم إنشاء القائمة" : "Queue generated"} {formatDate(queue.generatedAt, locale)}</span></div>
        </section>

        <section className="queueMetrics" aria-label={locale === "ar" ? "ملخص القائمة" : "Queue summary"}>
          <Button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button"><span>{locale === "ar" ? "الكل" : "All claims"}</span><strong>{queue.items.length}</strong></Button>
          {statuses.map((status) => (
            <Button className={filter === status ? `active status-${status}` : `status-${status}`} key={status} onClick={() => setFilter(status)} type="button"><span>{statusCopy[locale][status]}</span><strong>{queue.counts[status]}</strong></Button>
          ))}
        </section>

        <div className="operationsLayout">
          <section className="queuePanel" aria-labelledby="queue-heading">
            <div className="panelHeading"><div><p className="eyebrow">01 / QUEUE</p><h2 id="queue-heading">{locale === "ar" ? "مطالبات الأدلة" : "Evidence claims"}</h2></div><Button onClick={() => void refreshQueue()} title={locale === "ar" ? "تحديث" : "Refresh"} type="button"><RefreshCcw aria-hidden="true" size={17} /></Button></div>
            <div className="queueList">
              {items.map((item) => (
                <Button aria-pressed={selected?.id === item.id} className={selected?.id === item.id ? "queueItem selected" : "queueItem"} key={item.id} onClick={() => setSelectedId(item.id)} type="button">
                  <span className={`workflowDot ${item.workflowStatus}`} aria-hidden="true" />
                  <span className="queueItemIdentity"><strong>{localize(item.claim.label, locale)}</strong><small>{localize(item.propertyName, locale)} · v{item.version}</small></span>
                  <Badge className={`workflowBadge ${item.workflowStatus}`} variant="outline">{statusCopy[locale][item.workflowStatus]}</Badge>
                  <span className="queueItemDate">{formatDate(item.updatedAt, locale)}</span>
                </Button>
              ))}
              {!items.length ? <p className="emptyQueue">{locale === "ar" ? "لا توجد مطالبات في هذه الحالة." : "No claims in this state."}</p> : null}
            </div>
          </section>

          <section className="workPanel" aria-labelledby="work-heading">
            {selected ? (
              <>
                <div className="panelHeading"><div><p className="eyebrow">02 / REVIEW</p><h2 id="work-heading">{localize(selected.claim.label, locale)}</h2></div><Badge className={`workflowBadge ${selected.workflowStatus}`} variant="outline">{statusCopy[locale][selected.workflowStatus]}</Badge></div>
                <div className="workSummary">
                  <div><span>{locale === "ar" ? "الحالة المعروضة" : "Displayed state"}</span><strong>{localize(selected.claim.displayValue, locale)}</strong></div>
                  <div><span>{locale === "ar" ? "فئة المصدر" : "Source class"}</span><strong>{selected.claim.evidenceClass.replaceAll("_", " ")}</strong></div>
                  <div><span>{locale === "ar" ? "الإصدار التشغيلي" : "Workflow version"}</span><strong>v{selected.version}</strong></div>
                </div>

                <dl className="workEvidence">
                  <div><dt>{locale === "ar" ? "المصدر" : "Source"}</dt><dd>{localize(selected.claim.source, locale)}</dd></div>
                  <div><dt>{locale === "ar" ? "المنهج" : "Method"}</dt><dd>{localize(selected.claim.method, locale)}</dd></div>
                  <div><dt>{locale === "ar" ? "لوحظ" : "Observed"}</dt><dd>{selected.claim.observedAt ? formatDate(selected.claim.observedAt, locale) : "—"}</dd></div>
                  <div><dt>{locale === "ar" ? "تم الاسترجاع" : "Retrieved"}</dt><dd>{formatDate(selected.claim.retrievedAt, locale)}</dd></div>
                  <div><dt>{locale === "ar" ? "صالح حتى" : "Valid to"}</dt><dd>{selected.claim.validTo ? formatDate(selected.claim.validTo, locale) : "—"}</dd></div>
                  <div><dt>{locale === "ar" ? "المستند" : "Artifact"}</dt><dd>{selected.claim.artifactReference ?? "—"}</dd></div>
                </dl>

                {message ? <Alert className={`operationMessage ${message.kind}`} role="status">{message.kind === "success" ? <Check size={17} /> : <CircleAlert size={17} />}<AlertDescription>{message.text}</AlertDescription></Alert> : null}

                <div className="operationForms">
                  <div className="operationBlock">
                    <div><ShieldCheck aria-hidden="true" size={19} /><span><strong>{locale === "ar" ? "قرار المراجعة" : "Review decision"}</strong><small>{locale === "ar" ? "يلزم سبب واضح لكل قرار." : "Every decision needs a specific reason."}</small></span></div>
                    <label><span className="srOnly">{locale === "ar" ? "سبب المراجعة" : "Review reason"}</span><Textarea onChange={(event) => setReviewReason(event.target.value)} value={reviewReason} /></label>
                    <div className="operationButtons">
                      <Button disabled={Boolean(pending)} onClick={() => void perform("reviews", { decision: "approved", reason: reviewReason })} type="button"><Check size={16} />{locale === "ar" ? "اعتماد" : "Approve"}</Button>
                      <Button disabled={Boolean(pending)} onClick={() => void perform("reviews", { decision: "needs_information", reason: reviewReason })} type="button"><FileSearch size={16} />{locale === "ar" ? "طلب معلومات" : "Need information"}</Button>
                      <Button disabled={Boolean(pending)} onClick={() => void perform("reviews", { decision: "rejected", reason: reviewReason })} type="button"><X size={16} />{locale === "ar" ? "رفض" : "Reject"}</Button>
                    </div>
                  </div>

                  <div className="operationBlock compact">
                    <div><BadgeCheck aria-hidden="true" size={19} /><span><strong>{locale === "ar" ? "انتقال الحالة" : "State transition"}</strong><small>{locale === "ar" ? "النشر بعد الاعتماد فقط." : "Publication requires approval."}</small></span></div>
                    <div className="operationButtons">
                      <Button disabled={Boolean(pending) || selected.workflowStatus !== "approved"} onClick={() => void perform("publish", { reason: "Approved evidence published from operations console." })} type="button"><Send size={16} />{locale === "ar" ? "نشر" : "Publish"}</Button>
                      <Button disabled={Boolean(pending) || selected.workflowStatus !== "published"} onClick={() => void perform("expire", { reason: "Evidence expired by operations after a freshness review." })} type="button"><FileClock size={16} />{locale === "ar" ? "إنهاء الصلاحية" : "Expire"}</Button>
                    </div>
                  </div>

                  <div className="operationBlock">
                    <div><CircleAlert aria-hidden="true" size={19} /><span><strong>{locale === "ar" ? "طلب تصحيح" : "Request correction"}</strong><small>{locale === "ar" ? "التحدي مرئي ولا يحذف الحالة السابقة." : "The challenge stays visible and preserves history."}</small></span></div>
                    <label><span className="srOnly">{locale === "ar" ? "سبب التصحيح" : "Correction reason"}</span><Textarea onChange={(event) => setCorrectionReason(event.target.value)} placeholder={locale === "ar" ? "اشرح ما يحتاج إلى التحقق..." : "Explain what needs to be checked..."} value={correctionReason} /></label>
                    <Button className="correctionButton" disabled={Boolean(pending) || correctionReason.trim().length < 8} onClick={() => void perform("corrections", { reason: correctionReason })} type="button"><CircleAlert size={16} />{locale === "ar" ? "فتح تصحيح" : "Open correction"}</Button>
                  </div>
                </div>

                <div className="auditSection">
                  <h3><History aria-hidden="true" size={18} />{locale === "ar" ? "سجل التدقيق" : "Audit trail"}</h3>
                  <ol>{[...selected.auditTrail].reverse().map((event) => <li key={event.id}><span className={`workflowDot ${event.toStatus}`} /><div><strong>{event.action.replaceAll("_", " ")}</strong><small>{event.actorId} · {formatDate(event.createdAt, locale)} · v{event.version}</small>{event.reason ? <p>{event.reason}</p> : null}</div></li>)}</ol>
                </div>
              </>
            ) : <div className="emptyWork"><FileSearch size={28} /><p>{locale === "ar" ? "اختر مطالبة للمراجعة." : "Select a claim to review."}</p></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
