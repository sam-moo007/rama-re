import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DiscoveryExperience } from "@/features/discovery/components/discovery-experience";
import { getDiscoveryData, type DiscoverySearchParams } from "@/lib/catalogue-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Discover homes", robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<DiscoverySearchParams>;
};

export default async function DiscoverPage({ params, searchParams }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const data = await getDiscoveryData(await searchParams);
  return <DiscoveryExperience initialSearch={data.search} initialShortlist={data.shortlist.shortlist} locale={value} />;
}

