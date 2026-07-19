"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, User, Share2 } from "lucide-react";

type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
};

export function DecisionRoomComments({ propertyId, locale }: { propertyId: string; locale: string }) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "c1",
      author: "Partner Agent",
      text: "I've uploaded the new NOC document you requested. Let me know if you need anything else.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setComments([...comments, {
      id: Math.random().toString(),
      author: "You",
      text: input,
      timestamp: new Date().toISOString(),
    }]);
    setInput("");
  };

  const handleShare = () => {
    // Generate a mock secure link
    const link = `https://app.rama.com/${locale}/decision-room/${propertyId}?shareKey=abc123secure`;
    navigator.clipboard.writeText(link);
    alert("Secure share link copied to clipboard!");
  };

  return (
    <div className="flex flex-col h-[600px] border rounded overflow-hidden bg-white shadow-sm mt-8">
      <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-slate-900">Decision Room Collaboration</h3>
          <p className="text-xs text-slate-500">Secure, invite-only comments for this property.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="w-4 h-4 mr-2" /> Share Room
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm text-slate-900">{comment.author}</span>
                <span className="text-xs text-slate-500">
                  {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded border">
                {comment.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t bg-slate-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
        />
        <Button type="submit" size="icon" disabled={!input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
