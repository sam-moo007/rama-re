"use client";
import { Mic, MicOff, MousePointer2, User } from "lucide-react";
import { useState } from "react";
import { Locale } from "@/lib/i18n";

interface GuidedLiveTourProps {
  locale: Locale;
}

export function GuidedLiveTour({ locale }: GuidedLiveTourProps) {
  const [isMuted, setIsMuted] = useState(false);

  const t = locale === "ar" ? {
    title: "جولة حية موجهة",
    status: "متصل مع المستشار",
    advisor: "أحمد (مستشار عقاري)",
    endSession: "إنهاء الجلسة",
    pointer: "مؤشر المستشار نشط",
    mute: "كتم الصوت",
    unmute: "إلغاء الكتم"
  } : {
    title: "Guided Live Tour",
    status: "Connected with Advisor",
    advisor: "Ahmed (Property Advisor)",
    endSession: "End Session",
    pointer: "Advisor Pointer Active",
    mute: "Mute Audio",
    unmute: "Unmute Audio"
  };

  return (
    <div className="relative border rounded overflow-hidden bg-slate-900 aspect-video flex flex-col items-center justify-center text-white">
      {/* Mock Panorama Background */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
      
      {/* Advisor Pointer Stub */}
      <div className="absolute top-1/3 right-1/3 flex items-center gap-2 text-amber-400 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm animate-pulse z-10">
        <MousePointer2 size={16} />
        <span className="text-sm font-medium">{t.pointer}</span>
      </div>

      <div className="z-10 text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{t.title}</h3>
        <p className="text-slate-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse"></span>
          {t.status}
        </p>
      </div>

      {/* Floating Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded border border-slate-700">
        <div className="flex items-center gap-3 pr-6 border-r border-slate-600">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <User size={20} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">{t.advisor}</p>
            <p className="text-xs text-green-400">03:45</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
          title={isMuted ? t.unmute : t.mute}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
          {t.endSession}
        </button>
      </div>
    </div>
  );
}
