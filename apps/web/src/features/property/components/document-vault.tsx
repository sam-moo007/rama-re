import { FileText, Download, Lock, ShieldCheck, Eye } from "lucide-react";
import { Locale } from "@/lib/i18n";

interface DocumentVaultProps {
  locale: Locale;
}

export function DocumentVault({ locale }: DocumentVaultProps) {
  const t = locale === "ar" ? {
    title: "مخزن المستندات الآمن",
    subtitle: "مستندات مشفرة مع علامة مائية. يتم تسجيل جميع عمليات الوصول.",
    docs: [
      { id: "1", name: "سند الملكية (تم التحقق)", type: "PDF", size: "1.2 MB", date: "12 مايو 2026", verified: true },
      { id: "2", name: "مخطط الطابق (المطور)", type: "PDF", size: "3.4 MB", date: "01 أبريل 2026", verified: true },
      { id: "3", name: "شهادة عدم ممانعة (NOC)", type: "PDF", size: "0.8 MB", date: "يتطلب طلب وصول", verified: false }
    ],
    view: "عرض",
    download: "تحميل",
    locked: "مغلق",
    verified: "موثق"
  } : {
    title: "Secure Document Vault",
    subtitle: "Encrypted & watermarked documents. All access is strictly audited.",
    docs: [
      { id: "1", name: "Title Deed (Verified)", type: "PDF", size: "1.2 MB", date: "May 12, 2026", verified: true },
      { id: "2", name: "Floor Plan (Developer)", type: "PDF", size: "3.4 MB", date: "Apr 01, 2026", verified: true },
      { id: "3", name: "NOC Certificate", type: "PDF", size: "0.8 MB", date: "Requires Access Request", verified: false }
    ],
    view: "View",
    download: "Download",
    locked: "Locked",
    verified: "Verified"
  };

  return (
    <div className="bg-white rounded border overflow-hidden">
      <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Lock size={18} className="text-slate-600" />
            {t.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="hidden sm:block">
          <ShieldCheck size={32} className="text-green-600 opacity-20" />
        </div>
      </div>

      <div className="divide-y">
        {t.docs.map(doc => (
          <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded bg-${doc.verified ? 'blue' : 'slate'}-100 text-${doc.verified ? 'blue' : 'slate'}-600 flex items-center justify-center`}>
                <FileText size={20} />
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  {doc.name}
                  {doc.verified && <ShieldCheck size={14} className="text-green-600" />}
                </p>
                <div className="flex gap-3 text-xs text-slate-500 mt-1">
                  <span>{doc.type}</span>
                  <span>{doc.size}</span>
                  <span>{doc.date}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {doc.verified ? (
                <>
                  <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t.view}>
                    <Eye size={18} />
                  </button>
                  <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title={t.download}>
                    <Download size={18} />
                  </button>
                </>
              ) : (
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 text-slate-500 rounded cursor-not-allowed">
                  <Lock size={14} />
                  {t.locked}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
