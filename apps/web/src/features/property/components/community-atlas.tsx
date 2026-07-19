import { Map, Navigation, School, Sun, Trees } from "lucide-react";
import { Locale } from "@/lib/i18n";

interface CommunityAtlasProps {
  locale: Locale;
}

export function CommunityAtlas({ locale }: CommunityAtlasProps) {
  const t = locale === "ar" ? {
    title: "أطلس المجتمع وخرائط السيناريو",
    desc: "محاكاة لسيناريوهات المشي والظل في أوقات الذروة.",
    layers: ["مسارات المشي المشجرة", "تغطية الظل (صيفاً)", "مسار المدارس الآمن", "ازدحام الذروة الصباحية"],
    metrics: [
      { label: "مؤشر المشي", value: "85/100" },
      { label: "ظل منتصف النهار", value: "62%" },
      { label: "المسافة للمدرسة", value: "1.2 كم" }
    ]
  } : {
    title: "Community Scenario Atlas",
    desc: "Simulated walkability and shade coverage during peak times.",
    layers: ["Tree-lined Walkways", "Summer Shade Coverage", "Safe School Route", "Morning Peak Congestion"],
    metrics: [
      { label: "Walk Score", value: "85/100" },
      { label: "Midday Shade", value: "62%" },
      { label: "School Distance", value: "1.2 km" }
    ]
  };

  return (
    <div className="border rounded overflow-hidden bg-white">
      <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2">
            <Map className="text-blue-600" />
            {t.title}
          </h3>
          <p className="text-slate-500 mt-1">{t.desc}</p>
        </div>
        
        <div className="flex gap-4">
          {t.metrics.map(m => (
            <div key={m.label} className="bg-slate-50 px-3 py-2 rounded border text-center">
              <div className="text-xl font-bold text-slate-800">{m.value}</div>
              <div className="text-xs text-slate-500">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 h-[400px]">
        <div className="p-4 bg-slate-50 border-r md:col-span-1 space-y-3">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Map Layers</p>
          
          <label className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded shadow-sm cursor-pointer hover:border-blue-300">
            <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
            <Trees size={18} className="text-green-600" />
            <span className="text-sm font-medium">{t.layers[0]}</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:border-slate-300">
            <input type="checkbox" className="w-4 h-4" />
            <Sun size={18} className="text-amber-500" />
            <span className="text-sm font-medium">{t.layers[1]}</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:border-slate-300">
            <input type="checkbox" className="w-4 h-4" />
            <School size={18} className="text-purple-600" />
            <span className="text-sm font-medium">{t.layers[2]}</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded cursor-pointer hover:border-slate-300">
            <input type="checkbox" className="w-4 h-4" />
            <Navigation size={18} className="text-red-500" />
            <span className="text-sm font-medium">{t.layers[3]}</span>
          </label>
        </div>

        <div className="md:col-span-3 bg-slate-100 relative overflow-hidden">
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-50 grayscale"></div>
          
          {/* SVG Overlay representing the simulated layers */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
            <path d="M 200,400 Q 250,200 400,100 T 700,50" fill="none" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="12" strokeLinecap="round" />
            <path d="M 100,400 Q 150,200 300,100 T 600,50" fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="40" strokeLinecap="round" />
            
            <circle cx="400" cy="100" r="8" fill="#3b82f6" stroke="white" strokeWidth="3" />
            <circle cx="200" cy="400" r="8" fill="#22c55e" stroke="white" strokeWidth="3" />
          </svg>

          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded text-xs shadow-sm font-medium text-slate-600">
            Powered by PostGIS & OpenStreetMap
          </div>
        </div>
      </div>
    </div>
  );
}
