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
        <Link className="brand" href={brandHref as Route} aria-label="RAMA Real-Estate">
          <span className="brandMark" aria-hidden="true">R</span>
          <span>RAMA</span>
        </Link>
        <nav className="primaryNav" aria-label={locale === "ar" ? "التنقل الرئيسي" : "Primary navigation"}>
          {text.nav.map((item, index) => index === 0
            ? <Link href={discoverHref} key={item}>{item}</Link>
            : <a href="#fit" key={item}>{item}</a>)}
        </nav>
        <div className="headerActions">
          <Button className="iconAction" size="icon" variant="ghost" type="button">
            <Bookmark aria-hidden="true" size={18} strokeWidth={1.6} />
            <span className="srOnly">{text.save}</span>
          </Button>
          <Button className="iconAction compareHeader" size="icon" variant="ghost" type="button">
            <ArrowLeftRight aria-hidden="true" size={18} strokeWidth={1.6} />
            <span className="srOnly">{text.compare}</span>
          </Button>
          <div className="hidden sm:block">
            {slug && <ShareRoomDialog locale={locale} propertySlug={slug} />}
          </div>
          <Link className="languageLink" href={langHref as any}>
            {text.language}
          </Link>
          <Link className="askButton headerAsk" href={briefHref}>
            <MessageCircleMore aria-hidden="true" size={17} strokeWidth={1.7} />
            {locale === "ar" ? "أنشئ ملخصي" : "Build my brief"}
          </Link>
        </div>
      </div>
    </header>
  );
}
