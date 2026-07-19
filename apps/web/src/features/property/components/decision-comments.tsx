"use client";

import { useState } from "react";
import { MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

type Comment = {
  id: string;
  author: string;
  role: "advisor" | "partner" | "customer";
  text: string;
  timestamp: string;
};

export function DecisionComments({ locale }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setComments([
      ...comments,
      {
        id: Date.now().toString(),
        author: "You",
        role: "customer",
        text: newComment,
        timestamp: new Date().toISOString(),
      }
    ]);
    setNewComment("");
  };

  const timeAgo = (dateStr: string) => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const diff = new Date().getTime() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days > 0) return rtf.format(-days, "day");
    if (hours > 0) return rtf.format(-hours, "hour");
    return locale === "ar" ? "الآن" : "Just now";
  };

  return (
    <Card className="mt-8 border-dashed shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4 text-primary" />
          {locale === "ar" ? "نقاش غرفة القرار" : "Decision Room Discussion"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {comment.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium leading-none flex items-center gap-2">
                    {comment.author}
                    {comment.role === "advisor" && (
                      <span className="bg-primary text-primary-foreground text-[9px] uppercase tracking-wider px-1 rounded">
                        Advisor
                      </span>
                    )}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(comment.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted p-2 rounded rounded-tl-none">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={locale === "ar" ? "اكتب تعليقاً..." : "Write a comment..."} 
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newComment.trim()}>
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
