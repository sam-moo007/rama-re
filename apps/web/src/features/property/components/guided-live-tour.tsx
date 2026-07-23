"use client";
import { Mic, MicOff, MousePointer2, User, Video } from "lucide-react";
import { useState } from "react";
import { Locale } from "@/lib/i18n";

interface GuidedLiveTourProps {
  locale: Locale;
}

export function GuidedLiveTour({ locale }: GuidedLiveTourProps) {
  const [isMuted, setIsMuted] = useState(false);
  const isAr = locale === "ar";

  const t = isAr ? {
    title: "جولة حية موجهة مع مستشار",
    status: "متصل الآن",
    advisor: "أحمد (مستشار عقاري)",
    endSession: "إنهاء الجلسة",
    pointer: "مؤشر المستشار نشط",
    mute: "كتم الصوت",
    unmute: "إلغاء الكتم",
    liveTelemetry: "بث حي راما · 1080p",
  } : {
    title: "Guided Live Tour",
    status: "Connected with Advisor",
    advisor: "Ahmed (Property Advisor)",
    endSession: "End Session",
    pointer: "Advisor Pointer Active",
    mute: "Mute Audio",
    unmute: "Unmute Audio",
    liveTelemetry: "RAMA Live Stream · 1080p",
  };

  return (
    <div className="relative border border-border overflow-hidden bg-[#171717] aspect-video flex flex-col items-center justify-between text-white rounded-none shadow-md group">
      {/* Background Media View */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50 transition-opacity duration-700 group-hover:opacity-60"
        style={{ backgroundImage: "url('/images/property-living-room.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/60 pointer-events-none" />

      {/* Top Bar: Telemetry & Live Status */}
      <div className="relative z-10 w-full p-4 lg:p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-7 items-center justify-center bg-brand text-white text-xs font-bold rounded-none">
            <Video className="size-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">{t.title}</h3>
            <p className="text-[10px] text-[#B5B0A8] font-mono uppercase">{t.liveTelemetry}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 border border-white/20 text-xs text-white">
          <span className="size-2 bg-emerald-500 rounded-none animate-pulse" />
          <span className="font-medium text-[11px]">{t.status}</span>
        </div>
      </div>

      {/* Center: Advisor Pointer Highlight */}
      <div className="relative z-10 flex items-center gap-2 bg-brand/90 text-white px-3 py-1.5 border border-white/30 text-xs font-medium backdrop-blur-sm animate-pulse shadow-lg">
        <MousePointer2 className="size-4" />
        <span>{t.pointer}</span>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 w-full p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/75 backdrop-blur-md border-t border-white/10">
        
        {/* Advisor Profile Info */}
        <div className="flex items-center gap-3">
          <div className="size-9 bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-bold text-sm">
            <User className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{t.advisor}</p>
            <p className="text-[10px] font-mono text-emerald-400">03:45 · {isAr ? "البث متزامن" : "Live synced"}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2.5 border transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              isMuted 
                ? "bg-red-950/80 border-red-800 text-red-300 hover:bg-red-900" 
                : "bg-surface-subtle/20 border-white/20 text-white hover:bg-white/10"
            }`}
            title={isMuted ? t.unmute : t.mute}
          >
            {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            <span className="hidden md:inline">{isMuted ? t.unmute : t.mute}</span>
          </button>

          <button 
            type="button"
            className="flex-1 sm:flex-none bg-red-800 hover:bg-red-700 text-white border border-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {t.endSession}
          </button>
        </div>

      </div>
    </div>
  );
}
