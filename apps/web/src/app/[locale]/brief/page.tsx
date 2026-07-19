import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HouseholdBriefExperience } from "@/features/household-brief/components/household-brief-experience";
import { getMyHouseholdBriefs } from "@/lib/household-brief-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Household Brief", robots: { index: false, follow: false } };

type Props = { params: Promise<{ locale: string }> };

export default async function HouseholdBriefPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  let initialBrief = null;
  try {
    initialBrief = (await getMyHouseholdBriefs()).items[0] ?? null;
  } catch {
    // The interactive experience surfaces save/session errors without hiding the form.
  }
  return <HouseholdBriefExperience initialBrief={initialBrief} locale={value} />;
}
