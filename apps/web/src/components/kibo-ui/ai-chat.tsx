import * as React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Sparkles, Send } from "lucide-react";

export interface AIChatProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AIChat = React.forwardRef<HTMLDivElement, AIChatProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col rounded-xl border border-border bg-surface shadow-subtle overflow-hidden",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AIChat.displayName = "AIChat";

export interface AIMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant";
}

export const AIMessage = React.forwardRef<HTMLDivElement, AIMessageProps>(
  ({ className, role, children, ...props }, ref) => {
    const isUser = role === "user";
    return (
      <div
        ref={ref}
        className={cn("flex w-full", isUser ? "justify-end" : "justify-start", className)}
        {...props}
      >
        <div
          className={cn(
            "max-w-[85%] rounded-lg p-3.5 text-sm leading-relaxed",
            isUser
              ? "bg-brand text-white font-medium"
              : "bg-surface-subtle text-ink border border-border"
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
AIMessage.displayName = "AIMessage";

export interface AISourceCitationProps extends React.HTMLAttributes<HTMLDivElement> {
  source: string;
}

export const AISourceCitation = React.forwardRef<HTMLDivElement, AISourceCitationProps>(
  ({ className, source, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mt-2.5 inline-flex items-center gap-1.5 rounded bg-positive-soft px-2.5 py-1 text-xs font-semibold text-positive border border-positive/30",
          className
        )}
        {...props}
      >
        <ShieldCheck className="size-3.5 shrink-0 text-positive" />
        <span>{source}</span>
        {children}
      </div>
    );
  }
);
AISourceCitation.displayName = "AISourceCitation";
