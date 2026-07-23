"use client";
import { Bot, Send, ShieldAlert, UserPlus, Paperclip } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { useState } from "react";
import { AIChat, AIMessage, AISourceCitation } from "@/components/kibo-ui/ai-chat";

interface AiAdvisorChatProps {
  locale: Locale;
}

export function AiAdvisorChat({ locale }: AiAdvisorChatProps) {
  const [messages] = useState([
    { role: 'ai' as const, content: locale === "ar" ? "أهلاً بك! أنا مساعدك الذكي في راما. أستند فقط إلى الحقائق الموثقة والأدلة المعتمدة. كيف يمكنني مساعدتك في اتخاذ قرارك؟" : "Hello! I'm your RAMA smart assistant. I only retrieve facts based on verified evidence. How can I help you with your property decision?" },
    { role: 'user' as const, content: locale === "ar" ? "ما هي رسوم الصيانة المتوقعة لهذا العقار؟" : "What are the expected service charges for this property?" },
    { role: 'ai' as const, content: locale === "ar" ? "بناءً على بيانات دائرة الأراضي والأملاك لعام 2026، فإن رسوم الصيانة لمبنى Residence 1204 هي 18.5 درهم للقدم المربع." : "Based on DLD data from 2026, the service charge for Residence 1204 is 18.5 AED/sqft.", citation: "DLD Service Charge Index (2026)" }
  ]);

  const t = locale === "ar" ? {
    title: "مساعد راما الذكي",
    placeholder: "اسأل عن الأدلة أو الحقائق...",
    escalate: "تحويل إلى مستشار بشري",
    warning: "أنا لا أقدم نصائح استثمارية. جميع الحقائق مقتبسة من الأدلة."
  } : {
    title: "RAMA Smart Assistant",
    placeholder: "Ask about evidence or facts...",
    escalate: "Escalate to Human Advisor",
    warning: "I do not provide investment advice. All facts are cited from evidence."
  };

  return (
    <AIChat className="h-[500px]">
      <div className="p-4 border-b border-border flex justify-between items-center bg-surface-subtle">
        <h3 className="font-bold flex items-center gap-2 text-ink">
          <Bot className="text-brand size-5" />
          {t.title}
        </h3>
        <button className="text-sm flex items-center gap-1.5 text-text hover:text-brand transition-colors cursor-pointer bg-transparent border-none p-0">
          <UserPlus size={16} />
          {t.escalate}
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <AIMessage key={idx} role={msg.role === 'user' ? 'user' : 'assistant'}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            {msg.citation && (
              <AISourceCitation source={msg.citation} />
            )}
          </AIMessage>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-surface-subtle">
        <div className="text-xs text-muted mb-3 text-center flex items-center justify-center gap-1">
          <ShieldAlert size={14} className="text-brand" />
          {t.warning}
        </div>
        <div className="flex gap-2 relative">
          <button 
            type="button"
            className="p-2.5 text-muted hover:text-brand transition-colors border border-border bg-surface rounded-md cursor-pointer"
            onClick={() => alert(locale === "ar" ? "محاكاة الرفع للرؤية بالذكاء الاصطناعي" : "Simulate Vision AI Upload")}
          >
            <Paperclip size={18} />
          </button>
          <input 
            type="text" 
            placeholder={t.placeholder} 
            className="flex-1 border border-border bg-surface text-ink rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <button className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors cursor-pointer border-none font-semibold">
            <Send size={16} className={locale === "ar" ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </AIChat>
  );
}
