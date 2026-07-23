import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface AnnouncementProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
}

export const Announcement = React.forwardRef<HTMLDivElement, AnnouncementProps>(
  ({ className, href, children, ...props }, ref) => {
    const commonClasses = cn(
      "inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/95 px-3.5 py-1.5 text-xs text-ink transition-all duration-200 hover:border-brand/40 hover:bg-surface shadow-subtle cursor-pointer select-none",
      className
    );

    if (href) {
      return (
        <Link href={href} className={commonClasses} {...(props as any)}>
          {children}
        </Link>
      );
    }

    return (
      <div ref={ref} className={commonClasses} {...props}>
        {children}
      </div>
    );
  }
);
Announcement.displayName = "Announcement";

export interface AnnouncementTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "positive" | "caution";
}

export const AnnouncementTag = React.forwardRef<HTMLSpanElement, AnnouncementTagProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-surface-subtle text-ink border-border",
      brand: "bg-brand-soft text-brand border-brand/30",
      positive: "bg-positive-soft text-positive border-positive/30",
      caution: "bg-caution-soft text-caution border-caution/30",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
AnnouncementTag.displayName = "AnnouncementTag";

export interface AnnouncementTitleProps extends React.HTMLAttributes<HTMLSpanElement> {}

export const AnnouncementTitle = React.forwardRef<HTMLSpanElement, AnnouncementTitleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-1.5 font-medium text-ink", className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
AnnouncementTitle.displayName = "AnnouncementTitle";
