"use client";

import React, { useState } from "react";
import { Button } from "../../../components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
  citations?: { id: string; title: string; link: string }[];
  escalate?: boolean;
};

export function ChatInterface({ propertyId }: { propertyId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your AI concierge. I can answer questions using verified facts and evidence for this property. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`/api/v1/ai/chat/${propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      const data = await response.json();
      
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant", 
          content: data.reply,
          citations: data.citations,
          escalate: data.escalate
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "I encountered an error connecting to the verification engine. Please try again." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md bg-white border rounded shadow-lg overflow-hidden">
      <div className="bg-slate-900 text-white p-4 font-semibold flex items-center justify-between">
        <span>Verified AI Concierge</span>
        <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-500/30">
          Strict Mode
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`max-w-[85%] rounded px-4 py-2 ${
              m.role === "user" 
                ? "bg-blue-600 text-white rounded-br-none" 
                : "bg-white border text-slate-800 rounded-bl-none shadow-sm"
            }`}>
              {m.content}
            </div>
            
            {m.citations && m.citations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.citations.map((c, ci) => (
                  <a key={ci} href={c.link} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-300 transition-colors">
                    📄 {c.title}
                  </a>
                ))}
              </div>
            )}
            
            {m.escalate && (
              <div className="mt-3 w-full">
                <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
                  Connect to Human Advisor
                </Button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white border text-slate-500 px-4 py-2 rounded rounded-bl-none shadow-sm flex gap-1">
              <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: "0.2s"}}>.</span><span className="animate-bounce" style={{animationDelay: "0.4s"}}>.</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about costs, facts, evidence..."
            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}
