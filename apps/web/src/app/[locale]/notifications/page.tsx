import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerNotifications } from "@/features/communications/components/customer-notifications";
import { getCustomerNotifications } from "@/lib/communications-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications", robots: { index: false, follow: false } };
type Props = { params: Promise<{ locale: string }> };

export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  return <CustomerNotifications initial={await getCustomerNotifications()} locale={locale} />;
}
