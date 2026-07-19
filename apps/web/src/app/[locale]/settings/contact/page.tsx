import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerContactSettings } from "@/features/communications/components/customer-contact-settings";
import { getContactProfile } from "@/lib/communications-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Protected contact", robots: { index: false, follow: false } };
type Props = { params: Promise<{ locale: string }> };

export default async function ContactSettingsPage({ params }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <CustomerContactSettings initialProfile={await getContactProfile()} locale={locale} />;
}
