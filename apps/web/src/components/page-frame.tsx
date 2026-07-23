import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageFrameProps {
  children: ReactNode;
  className?: string;
  locale?: "en" | "ar";
}

export function PageFrame({ children, className, locale = "en" }: PageFrameProps) {
  const isAr = locale === "ar";
  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      lang={locale}
      className={cn("min-h-screen bg-[var(--color-canvas,#f6f5f1)] text-[var(--color-ink,#1e211f)] selection:bg-[var(--color-brand-soft,#eee5dc)]", className)}
    >
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {children}
      </main>
    </div>
  );
}
