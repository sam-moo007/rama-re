import { CheckCircle, AlertCircle, Wrench, Camera, Clock } from "lucide-react";
import { Locale } from "@/lib/i18n";

interface SnaggingListProps {
  locale: Locale;
}

export function SnaggingList({ locale }: SnaggingListProps) {
  const t = locale === "ar" ? {
    title: "سجل الفحص والصيانة (Snagging)",
    subtitle: "تتبع العيوب والمشكلات مع المطور العقاري قبل التسليم النهائي.",
    items: [
      { id: "1", location: "المطبخ الرئيسية", issue: "خدش في سطح الرخام", status: "pending", date: "منذ يومين" },
      { id: "2", location: "الحمام الثاني", issue: "تسريب خفيف أسفل الحوض", status: "in-progress", date: "منذ 4 أيام" },
      { id: "3", location: "غرفة النوم", issue: "مقبض الباب غير مثبت جيداً", status: "resolved", date: "تم الحل" }
    ],
    pending: "قيد الانتظار",
    inProgress: "قيد العمل",
    resolved: "تم الحل",
    addSnag: "إضافة ملاحظة جديدة"
  } : {
    title: "Handover Snagging List",
    subtitle: "Track defects and issues with the developer before final handover.",
    items: [
      { id: "1", location: "Main Kitchen", issue: "Scratch on marble countertop", status: "pending", date: "2 days ago" },
      { id: "2", location: "Guest Bathroom", issue: "Minor leak under sink", status: "in-progress", date: "4 days ago" },
      { id: "3", location: "Master Bedroom", issue: "Door handle loose", status: "resolved", date: "Resolved" }
    ],
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    addSnag: "Add New Snag"
  };

  return (
    <div className="bg-white rounded border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Wrench className="text-blue-600" />
            {t.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm flex items-center gap-2 transition-colors">
          <Camera size={16} />
          {t.addSnag}
        </button>
      </div>

      <div className="space-y-4">
        {t.items.map(item => (
          <div key={item.id} className="flex items-start justify-between p-4 border rounded hover:border-slate-300 transition-colors">
            <div className="flex items-start gap-4">
              {item.status === 'resolved' ? (
                <CheckCircle className="text-green-500 mt-1" size={20} />
              ) : item.status === 'in-progress' ? (
                <Clock className="text-amber-500 mt-1" size={20} />
              ) : (
                <AlertCircle className="text-red-500 mt-1" size={20} />
              )}
              
              <div>
                <h4 className="font-semibold">{item.issue}</h4>
                <p className="text-sm text-slate-500 mt-0.5">{item.location}</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-1
                ${item.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                  item.status === 'in-progress' ? 'bg-amber-100 text-amber-700' : 
                  'bg-red-100 text-red-700'}`}>
                {item.status === 'resolved' ? t.resolved : 
                 item.status === 'in-progress' ? t.inProgress : t.pending}
              </span>
              <p className="text-xs text-slate-400">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
