import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DiscoveryExperience } from "@/features/discovery/components/discovery-experience";
import { getDiscoveryData, type DiscoverySearchParams } from "@/lib/catalogue-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Homes — RAMA Dubai Verified Residential",
  description: "Browse verified Dubai properties with plain-language evidence, complete cost estimates, and location fit.",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<DiscoverySearchParams>;
};

export default async function HomesPage({ params, searchParams }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const data = await getDiscoveryData(await searchParams);
  return <DiscoveryExperience initialSearch={data.search} initialShortlist={data.shortlist.shortlist} locale={value} />;
}
