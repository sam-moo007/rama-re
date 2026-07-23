import { Box, Building, Compass, Layers } from "lucide-react";
import { Locale } from "@/lib/i18n";

interface DistrictMap3DProps {
  locale: Locale;
}

export function DistrictMap3D({ locale }: DistrictMap3DProps) {
  const t = locale === "ar" ? {
    title: "خريطة المنطقة ثلاثية الأبعاد",
    subtitle: "السياق الحضري والارتفاعات ومحاكاة زوايا الشمس.",
    controls: ["عرض الشارع", "كتل المباني", "اتجاه الشمس"],
    warning: "العرض ثلاثي الأبعاد مقدر وقد لا يمثل التطوير المستقبلي غير المعلن."
  } : {
    title: "3D District Context",
    subtitle: "Urban massing, elevation, and sun angle simulation.",
    controls: ["Street View", "Building Massing", "Sun Angles"],
    warning: "3D context is modeled and may not represent unannounced future development."
  };

  return (
    <div className="border rounded bg-slate-900 text-white overflow-hidden relative group">
      {/* 3D Canvas Mockup */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
      
      <div className="relative p-6 h-[450px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-xl flex items-center gap-2">
              <Box className="text-blue-400" />
              {t.title}
            </h3>
            <p className="text-slate-300 mt-1 max-w-md">{t.subtitle}</p>
          </div>
          
          <div className="bg-black/50 backdrop-blur-md p-1.5 rounded border border-white/10 flex flex-col gap-1">
            <button className="p-2 hover:bg-white/20 rounded transition-colors text-slate-300 hover:text-white" title={t.controls[0]}>
              <Layers size={18} />
            </button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors text-blue-400" title={t.controls[1]}>
              <Building size={18} />
            </button>
            <button className="p-2 hover:bg-white/20 rounded transition-colors text-slate-300 hover:text-white" title={t.controls[2]}>
              <Compass size={18} />
            </button>
          </div>
        </div>

        <div>
          <div className="inline-block bg-amber-500/20 border border-amber-500/50 text-amber-200 text-xs px-3 py-2 rounded mb-4">
            {t.warning}
          </div>
          <div className="flex gap-2 text-xs text-slate-400 font-mono">
            <span className="bg-black/50 px-2 py-1 rounded border border-white/10">LAT: 25.0768° N</span>
            <span className="bg-black/50 px-2 py-1 rounded border border-white/10">LON: 55.1328° E</span>
            <span className="bg-black/50 px-2 py-1 rounded border border-white/10 ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-none bg-green-500"></span>
              CESIUM_READY
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
