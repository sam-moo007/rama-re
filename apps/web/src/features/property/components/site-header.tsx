import { ArrowLeftRight, Bookmark, MessageCircleMore } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ShareRoomDialog } from "./share-room-dialog";
import { copy, type Locale } from "@/lib/i18n";

type SiteHeaderProps = {
  locale: Locale;
  slug?: string;
};

export function SiteHeader({ locale, slug }: SiteHeaderProps) {
  const text = copy[locale];
  const otherLocale = locale === "en" ? "ar" : "en";
  const briefHref = `/${locale}/brief` as Route;
  const discoverHref = `/${locale}/discover` as Route;
  
  const brandHref = slug ? `/${locale}/properties/${slug}` : discoverHref;
  const langHref = slug ? `/${otherLocale}/properties/${slug}` : `/${otherLocale}`;

  return (
    <header className="siteHeader">
      <div className="siteHeaderInner">
        <Link className="brand" href={`/${locale}/discover` as Route} aria-label="RAMA Real-Estate">
          <span className="brandMark" aria-hidden="true">R</span>
          <span>RAMA</span>
        </Link>
        <nav className="primaryNav" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Primary navigation"}>
          <Link href={`/${locale}/discover` as Route}>{locale === "ar" ? "العقارات" : "Homes"}</Link>
          <Link href={`/${locale}/compare` as Route}>{locale === "ar" ? "مقارنة" : "Compare"}</Link>
          <Link href={`/${locale}/cost-engine` as Route}>{locale === "ar" ? "التكاليف" : "Costs"}</Link>
        </nav>
        <div className="headerActions">
          {slug && <ShareRoomDialog locale={locale} propertySlug={slug} />}
          <Link className="languageLink" href={langHref as any}>
            {text.language}
          </Link>
          <Link className="askButton headerAsk" href={`/${locale}/advisor` as Route}>
            <MessageCircleMore aria-hidden="true" size={17} strokeWidth={1.7} />
            {locale === "ar" ? "تواصل معنا" : "Check availability"}
          </Link>
        </div>
      </div>
    </header>
  );
}
