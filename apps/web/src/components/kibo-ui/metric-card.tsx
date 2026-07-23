import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      className,
      label,
      value,
      subvalue,
      trend,
      trendDirection = "up",
      children,
      ...props
    },
    ref
  ) => {
    const trendStyles = {
      up: "text-positive bg-positive-soft border-positive/30",
      down: "text-critical bg-critical-soft border-critical/30",
      neutral: "text-muted bg-surface-subtle border-border",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col justify-between rounded-xl border border-border bg-surface p-5 shadow-subtle transition-all duration-200 hover:border-brand/40",
          className
        )}
        {...props}
      >
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</span>
            {trend && (
              <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", trendStyles[trendDirection])}>
                {trend}
              </span>
            )}
          </div>
          <div className="mt-2 font-serif text-2xl font-semibold text-ink tabular-nums">{value}</div>
          {subvalue && <p className="mt-1 text-xs text-text">{subvalue}</p>}
        </div>
        {children}
      </div>
    );
  }
);
MetricCard.displayName = "MetricCard";
