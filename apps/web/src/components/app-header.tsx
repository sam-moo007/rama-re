"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { Container } from "@/components/ui/container";

interface AppHeaderProps {
  locale: Locale;
  variant?: "default" | "landing" | "operations";
  title?: string;
  badge?: string;
  isAuthenticated?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AppHeader({ locale, variant = "default", title, badge, isAuthenticated = true }: AppHeaderProps) {
  const [menuState, setMenuState] = useState(false);
  const isAr = locale === "ar";
  const otherLocale = isAr ? "en" : "ar";
  const languageLabel = isAr ? "English" : "العربية";

  const handleSignOut = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.href = `/${locale}/login`;
    });
  };

  const navLinks = [
    { href: `/${locale}/homes`, label: isAr ? "العقارات" : "Homes" },
    { href: `/${locale}/costs`, label: isAr ? "التكاليف" : "Costs" },
    { href: `/${locale}/plan`, label: isAr ? "التخطيط" : "Plan" },
    { href: `/${locale}/compare`, label: isAr ? "مقارنة" : "Compare" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-canvas/80 backdrop-blur-3xl transition-all duration-300">
      <Container size="wide" className="flex h-20 items-center justify-between px-6 lg:px-16">
        {/* Brand & Context */}
        <div className="flex items-center gap-4">
          <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-lg text-ink hover:opacity-90">
            <span className="flex size-9 items-center justify-center rounded-none bg-brand text-white font-bold text-sm shadow-inner">
              R
            </span>
            <span className="tracking-wider text-base font-semibold">RAMA</span>
          </Link>
          {badge && (
            <span className="rounded bg-[var(--color-surface-subtle,#efeee9)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted,#6b726d)] border border-[var(--color-border,#d9ddd8)]">
              {badge}
            </span>
          )}
          {title && (
            <div className="hidden sm:block border-s border-border ps-3 text-xs text-text">
              <span className="font-semibold">{title}</span>
            </div>
          )}
        </div>

        {/* Primary Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-text" aria-label={isAr ? "التنقل الرئيسي" : "Main Navigation"}>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href as any} className="pencil-underline">
              {link.label}
            </Link>
          ))}
          
          <div className="h-4 w-px bg-border mx-1" aria-hidden="true" />

          <Link
            href={`/${otherLocale}/homes` as any}
            lang={otherLocale}
            className="text-xs font-bold text-text hover:text-brand transition-colors"
          >
            {languageLabel}
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-semibold text-text hover:text-critical transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              {isAr ? "تسجيل الخروج" : "Sign out"}
            </button>
          ) : (
            <Link
              href={`/${locale}/login` as any}
              className="text-xs font-semibold text-text hover:text-brand transition-colors"
            >
              {isAr ? "تسجيل الدخول" : "Sign in"}
            </Link>
          )}
        </nav>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMenuState(!menuState)}
          aria-label={menuState ? (isAr ? "إغلاق القائمة" : "Close Menu") : (isAr ? "فتح القائمة" : "Open Menu")}
          className="lg:hidden p-2 rounded-none text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
        >
          {menuState ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </Container>

      {/* Mobile Navigation Drawer */}
      {menuState && (
        <div className="lg:hidden border-b border-border bg-canvas/95 backdrop-blur-2xl px-6 py-6 space-y-5 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4 text-base font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={() => setMenuState(false)}
                className="text-ink hover:text-brand transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <Link
              href={`/${otherLocale}/homes` as any}
              lang={otherLocale}
              onClick={() => setMenuState(false)}
              className="text-sm font-semibold text-brand"
            >
              {languageLabel}
            </Link>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-critical bg-transparent border-none p-0 cursor-pointer"
              >
                {isAr ? "تسجيل الخروج" : "Sign out"}
              </button>
            ) : (
              <Link
                href={`/${locale}/login` as any}
                onClick={() => setMenuState(false)}
                className="text-sm font-medium text-brand"
              >
                {isAr ? "تسجيل الدخول" : "Sign in"}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
