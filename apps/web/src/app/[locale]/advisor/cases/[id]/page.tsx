import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Advisor Case — RAMA" };

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdvisorCasePage({ params }: Props) {
  const { locale: value, id } = await params;
  if (!isLocale(value)) notFound();

  const isAr = value === "ar";
  const dir = isAr ? "rtl" : "ltr";

  // Mock data for the case
  const caseData = {
    title: isAr ? "تحليل قرار الشراء - مارينا بنتهاوس" : "Purchase Decision Analysis - Marina Penthouse",
    status: isAr ? "نشط" : "Active",
    client: "Sarah Al-Fayed",
    property: isAr ? "مارينا بنتهاوس 5401" : "Marina Penthouse 5401",
    lastUpdated: isAr ? "منذ ساعتين" : "2 hours ago",
    progress: 65,
  };

  return (
    <main lang={value} dir={dir} className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Advisor Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href={`/${value}/advisor` as any} className="text-slate-500 hover:text-slate-900 transition-colors">
            ← {isAr ? "العودة للوحة التحكم" : "Back to Dashboard"}
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <h1 className="text-xl font-bold tracking-tight">
            {isAr ? "رقم القضية:" : "Case ID:"} {id}
          </h1>
          <span className="px-2.5 py-1 rounded-none bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            {caseData.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            {isAr ? "تصعيد للإدارة" : "Escalate"}
          </Button>
          <Button size="sm">
            {isAr ? "حفظ التغييرات" : "Save Changes"}
          </Button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-73px)] overflow-hidden">
        
        {/* Left Column: Context & Evidence */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-6">
          <div className="bg-white rounded border p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              {isAr ? "سياق العميل" : "Client Context"}
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">{isAr ? "العميل" : "Client"}</p>
                <p className="font-medium">{caseData.client}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">{isAr ? "العقار المستهدف" : "Target Property"}</p>
                <Link href={`/${value}/properties/marina-penthouse-5401` as any} className="font-medium text-blue-600 hover:underline">
                  {caseData.property}
                </Link>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">{isAr ? "جاهزية القرار" : "Decision Readiness"}</p>
                <div className="h-2 w-full bg-slate-100 rounded-none overflow-hidden">
                  <div className="h-full bg-green-500 rounded-none" style={{ width: `${caseData.progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded border p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {isAr ? "الأسئلة المعلقة" : "Open Questions"}
              </h2>
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-none font-bold">2</span>
            </div>
            <ul className="space-y-3">
              <li className="p-3 rounded border border-amber-200 bg-amber-50 text-sm">
                <strong>Q:</strong> {isAr ? "هل تم تأكيد رسوم الخدمة لعام 2026؟" : "Is the 2026 service charge confirmed?"}
                <div className="mt-2 text-xs text-slate-500">
                  {isAr ? "تتطلب مراجعة هيئة التنظيم العقاري" : "Requires RERA portal check"}
                </div>
              </li>
              <li className="p-3 rounded border border-amber-200 bg-amber-50 text-sm">
                <strong>Q:</strong> {isAr ? "مراجعة عقد صيانة المسبح الخاص." : "Review private pool maintenance contract."}
                <div className="mt-2 text-xs text-slate-500">
                  {isAr ? "في انتظار وثيقة من البائع" : "Awaiting document from seller"}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Communication/Timeline */}
        <div className="lg:col-span-2 bg-white rounded border shadow-sm flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              {isAr ? "مساحة العمل والتواصل" : "Workspace & Communication"}
            </h2>
            <div className="flex gap-2">
              <button className="text-sm px-3 py-1.5 rounded bg-white border shadow-sm font-medium hover:bg-slate-50">
                {isAr ? "ملاحظات داخلية" : "Internal Notes"}
              </button>
              <button className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white font-medium hover:bg-slate-800">
                {isAr ? "مراسلة العميل" : "Message Client"}
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {/* System Note */}
            <div className="flex justify-center">
              <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-none font-medium">
                {isAr ? "تم تعيين القضية لك" : "Case assigned to you"} — {caseData.lastUpdated}
              </span>
            </div>
            
            {/* Client Message */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-none bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                SA
              </div>
              <div className="bg-white border p-4 rounded rounded-tl-sm shadow-sm max-w-[80%]">
                <p className="text-sm">
                  {isAr 
                    ? "مرحباً، لقد اطلعت على غرفة القرار الخاصة بالبنتهاوس. يبدو كل شيء جيداً ولكنني قلقة قليلاً بشأن رسوم الخدمة المتوقعة لعام 2026. هل يمكنك توضيح ذلك؟" 
                    : "Hi, I've reviewed the decision room for the penthouse. Everything looks good but I'm a bit concerned about the projected service charges for 2026. Can you clarify this?"}
                </p>
                <span className="text-xs text-slate-400 mt-2 block">10:42 AM</span>
              </div>
            </div>

            {/* Internal Note Mock */}
            <div className="flex gap-4 flex-row-reverse">
              <div className="w-8 h-8 rounded-none bg-slate-800 flex items-center justify-center text-white font-bold shrink-0">
                ME
              </div>
              <div className="bg-amber-50 border border-amber-200 p-4 rounded rounded-tr-sm shadow-sm max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">{isAr ? "ملاحظة داخلية" : "Internal Note"}</span>
                </div>
                <p className="text-sm text-slate-800">
                  {isAr
                    ? "أقوم بفحص أحدث مؤشر لهيئة التنظيم العقاري (RERA). المعدل لعام 2025 هو 38 درهم/قدم مربع. تاريخياً الزيادة لا تتعدى 5% في المارينا، سأجهز رداً مدعوماً بالبيانات التاريخية."
                    : "Checking the latest RERA index. 2025 rate is 38 AED/sqft. Historically max 5% increase in Marina. Preparing a data-backed response."}
                </p>
                <span className="text-xs text-slate-400 mt-2 block">10:45 AM</span>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t">
            <div className="relative">
              <textarea 
                className="w-full min-h-[100px] border rounded p-3 pr-12 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isAr ? "اكتب رسالة للعميل..." : "Type a message to the client..."}
                dir={dir}
              />
              <button className="absolute bottom-3 right-3 (isAr ? 'left-3 right-auto' : 'right-3') p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <div className="flex gap-2">
                <button className="text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                </button>
                <button className="text-slate-400 hover:text-slate-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </button>
              </div>
              <span className="text-xs text-slate-400">
                {isAr ? "اضغط Enter للإرسال" : "Press Enter to send"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
