# Shared Layout Components

## Header Navigation (`apps/web/src/components/app-header.tsx`)

```tsx
import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Compass, Calculator, Layers, ClipboardCheck, ArrowLeft, ArrowRight } from "lucide-react";

interface AppHeaderProps {
  locale: Locale;
  variant?: "default" | "landing";
}

export function AppHeader({ locale, variant = "default" }: AppHeaderProps) {
  const isAr = locale === "ar";
  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border,#d9ddd8)] bg-white/95 backdrop-blur support-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[var(--color-ink,#1e211f)] text-white font-bold text-sm tracking-wider">
              R
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--color-ink,#1e211f)]">
              RAMA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href={`/${locale}/homes`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--color-ink,#1e211f)] hover:text-[var(--color-brand,#896548)] rounded hover:bg-[var(--color-surface-subtle,#efeee9)] transition-colors"
            >
              <Compass className="size-3.5" />
              <span>{isAr ? "العقارات الموثقة" : "Verified Homes"}</span>
            </Link>
            <Link
              href={`/${locale}/costs`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--color-ink,#1e211f)] hover:text-[var(--color-brand,#896548)] rounded hover:bg-[var(--color-surface-subtle,#efeee9)] transition-colors"
            >
              <Calculator className="size-3.5" />
              <span>{isAr ? "حاسبة التكاليف" : "Cost Calculator"}</span>
            </Link>
            <Link
              href={`/${locale}/plan`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--color-ink,#1e211f)] hover:text-[var(--color-brand,#896548)] rounded hover:bg-[var(--color-surface-subtle,#efeee9)] transition-colors"
            >
              <ClipboardCheck className="size-3.5" />
              <span>{isAr ? "خطة الشراء" : "Buying Plan"}</span>
            </Link>
            <Link
              href={`/${locale}/compare`}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--color-ink,#1e211f)] hover:text-[var(--color-brand,#896548)] rounded hover:bg-[var(--color-surface-subtle,#efeee9)] transition-colors"
            >
              <Layers className="size-3.5" />
              <span>{isAr ? "مقارنة العقارات" : "Compare"}</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={isAr ? "/en" : "/ar"}
            className="text-xs font-semibold px-2.5 py-1.5 rounded border border-[var(--color-border,#d9ddd8)] bg-[var(--color-surface-subtle,#efeee9)] hover:bg-[var(--color-border,#d9ddd8)] transition-colors text-[var(--color-ink,#1e211f)]"
          >
            {isAr ? "English" : "العربية"}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="text-xs font-semibold px-3 py-1.5 rounded bg-[var(--color-brand,#896548)] hover:bg-[var(--color-brand-hover,#73533a)] text-white transition-colors"
          >
            {isAr ? "تسجيل الدخول" : "Sign in"}
          </Link>
        </div>
      </div>
    </header>
  );
}
```
