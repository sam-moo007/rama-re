"use client";
import { Bot, Send, ShieldAlert, UserPlus, Paperclip } from "lucide-react";
import { Locale } from "@/lib/i18n";
import { useState } from "react";

interface AiAdvisorChatProps {
  locale: Locale;
}

export function AiAdvisorChat({ locale }: AiAdvisorChatProps) {
  const [messages] = useState([
    { role: 'ai', content: locale === "ar" ? "أهلاً بك! أنا مساعدك الذكي في راما. أستند فقط إلى الحقائق الموثقة والأدلة المعتمدة. كيف يمكنني مساعدتك في اتخاذ قرارك؟" : "Hello! I'm your RAMA smart assistant. I only retrieve facts based on verified evidence. How can I help you with your property decision?" },
    { role: 'user', content: locale === "ar" ? "ما هي رسوم الصيانة المتوقعة لهذا العقار؟" : "What are the expected service charges for this property?" },
    { role: 'ai', content: locale === "ar" ? "بناءً على بيانات دائرة الأراضي والأملاك لعام 2026، فإن رسوم الصيانة لمبنى Residence 1204 هي **18.5 درهم للقدم المربع**. [1]" : "Based on DLD data from 2026, the service charge for Residence 1204 is **18.5 AED/sqft**. [1]", citation: "DLD Service Charge Index (2026)" }
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
    <div className="bg-white rounded border shadow-sm flex flex-col h-[500px]">
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <h3 className="font-bold flex items-center gap-2">
          <Bot className="text-blue-600" />
          {t.title}
        </h3>
        <button className="text-sm flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors">
          <UserPlus size={16} />
          {t.escalate}
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded p-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.citation && (
                <div className="mt-2 text-xs opacity-75 border-t border-slate-300 pt-2 flex items-center gap-1">
                  <ShieldAlert size={12} />
                  [1] {msg.citation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-slate-50">
        <div className="text-xs text-slate-500 mb-3 text-center flex items-center justify-center gap-1">
          <ShieldAlert size={14} />
          {t.warning}
        </div>
        <div className="flex gap-2 relative">
          <button 
            type="button"
            className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
            onClick={() => alert(locale === "ar" ? "محاكاة الرفع للرؤية بالذكاء الاصطناعي" : "Simulate Vision AI Upload")}
          >
            <Paperclip size={18} />
          </button>
          <input 
            type="text" 
            placeholder={t.placeholder} 
            className="flex-1 border rounded px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white w-10 h-10 rounded flex items-center justify-center transition-colors">
            <Send size={16} className={locale === "ar" ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}
