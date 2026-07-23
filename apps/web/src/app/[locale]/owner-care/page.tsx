import React from "react";
import { SiteHeader } from "../../../features/property/components/site-header";

// Hardcoded demo snag tickets — in production these come from /api/v1/owner-care/properties/:id/snags
const DEMO_TICKETS = [
  {
    id: "snag-001",
    title: "Scratched floor in master bedroom",
    description: "Approximately 30cm scratch near wardrobe entrance",
    status: "open" as const,
    priority: "medium" as const,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "snag-002",
    title: "AC not cooling in living room",
    description: "Unit reaches set point temperature but takes 2x longer than expected",
    status: "in_progress" as const,
    priority: "high" as const,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "snag-003",
    title: "Paint touch-up required on kitchen wall",
    description: "Small chip near the extractor hood",
    status: "resolved" as const,
    priority: "low" as const,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

const STATUS_LABEL: Record<string, string> = {
  open: "OPEN",
  in_progress: "IN PROGRESS",
  resolved: "RESOLVED",
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

const PRIORITY_STYLE: Record<string, string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-slate-400",
};

export default async function OwnerCarePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale as "en" | "ar";

  return (
    <div className="min-h-screen bg-[#f5f1e8]" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <SiteHeader locale={locale} />

      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-[#6c746f] uppercase mb-1">RAMA / OWNER CARE</p>
            <h1 className="text-3xl font-[Georgia,serif] font-medium tracking-tight text-[#17211d]">
              {locale === "ar" ? "رعاية المالك والجرد" : "Owner Care & Snagging"}
            </h1>
            <p className="mt-2 text-sm text-[#6c746f]">
              {locale === "ar"
                ? "تتبع تقدم التسليم وأبلغ عن العيوب."
                : "Track handover progress and report property defects."}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <a
              href={`/${locale}/owner-care/snags/new`}
              className="inline-flex items-center gap-2 rounded bg-[#b56f49] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#995b3b] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={16} height={16}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {locale === "ar" ? "إبلاغ عن عيب" : "Report Snag"}
            </a>
            <a
              href={`/${locale}/owner-care/utilities`}
              className="inline-flex items-center gap-2 rounded border border-[rgba(23,33,29,0.22)] bg-white px-4 py-2.5 text-sm font-bold text-[#17211d] hover:border-[#17211d] transition-colors"
            >
              {locale === "ar" ? "توصيل الخدمات" : "Utility Connect"}
            </a>
          </div>
        </div>

        {/* Progress steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            {
              num: "1",
              titleEn: "Keys Handover",
              titleAr: "استلام المفاتيح",
              subEn: `Scheduled ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`,
              subAr: `مجدول ${new Date().toLocaleDateString("ar-AE")}`,
              done: true,
              active: false,
            },
            {
              num: "2",
              titleEn: "Snagging & Inspection",
              titleAr: "الجرد والتفتيش",
              subEn: `${DEMO_TICKETS.filter((t) => t.status !== "resolved").length} Active Reports`,
              subAr: `${DEMO_TICKETS.filter((t) => t.status !== "resolved").length} تقرير نشط`,
              done: false,
              active: true,
            },
            {
              num: "3",
              titleEn: "Title Deed Transfer",
              titleAr: "نقل سند الملكية",
              subEn: "Pending Inspection",
              subAr: "في انتظار التفتيش",
              done: false,
              active: false,
            },
          ].map((step) => (
            <div
              key={step.num}
              className={`rounded border p-6 flex flex-col items-center text-center transition-all ${
                step.active
                  ? "border-[#b56f49] bg-white shadow-md ring-1 ring-[#b56f49]"
                  : step.done
                  ? "border-[#718579] bg-[#e8eee9]"
                  : "border-[rgba(23,33,29,0.12)] bg-white opacity-50"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-none flex items-center justify-center mb-3 font-bold text-lg ${
                  step.active
                    ? "bg-[#b56f49] text-white"
                    : step.done
                    ? "bg-[#718579] text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {step.done ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" width={18} height={18}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <h3 className="font-semibold text-[#17211d] text-sm mb-1">
                {locale === "ar" ? step.titleAr : step.titleEn}
              </h3>
              <p className="text-xs text-[#6c746f]">{locale === "ar" ? step.subAr : step.subEn}</p>
            </div>
          ))}
        </div>

        {/* Snag tickets */}
        <div className="bg-white rounded border border-[rgba(23,33,29,0.14)] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[rgba(23,33,29,0.1)] flex items-center justify-between">
            <h2 className="font-semibold text-[#17211d]">
              {locale === "ar" ? "تقارير العيوب" : "Snag Reports"}
            </h2>
            <span className="text-xs font-bold text-[#6c746f]">
              {DEMO_TICKETS.length} {locale === "ar" ? "تقرير" : "total"}
            </span>
          </div>
          <ul className="divide-y divide-[rgba(23,33,29,0.08)]">
            {DEMO_TICKETS.map((ticket) => (
              <li
                key={ticket.id}
                className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-[#f5f1e8] transition-colors cursor-pointer"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-semibold text-[#17211d]">{ticket.title}</span>
                  <span className="text-xs text-[#6c746f]">{ticket.description}</span>
                  <span className="text-xs text-[#9da5a0]">
                    {locale === "ar" ? "تاريخ الإبلاغ:" : "Reported:"}{" "}
                    {new Date(ticket.createdAt).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-bold ${PRIORITY_STYLE[ticket.priority]}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-1 rounded-none text-xs font-bold ${STATUS_STYLE[ticket.status]}`}>
                    {STATUS_LABEL[ticket.status]}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect to API notice */}
        <div className="mt-6 rounded border border-[rgba(23,33,29,0.12)] bg-[#f3ead7] p-4 text-xs text-[#6c746f]">
          <strong className="text-[#17211d]">Note:</strong>{" "}
          {locale === "ar"
            ? "البيانات الموضحة تجريبية. في الإنتاج، تأتي التذاكر من واجهة /api/v1/owner-care/properties/:id/snags"
            : "Data shown is demo. In production, tickets are fetched from /api/v1/owner-care/properties/:id/snags"}
        </div>
      </main>
    </div>
  );
}
