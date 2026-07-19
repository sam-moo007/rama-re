import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdvisorCaseConsole } from "@/features/advisor/components/advisor-case-console";
import { getAdvisorQueueData } from "@/lib/decision-case-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Advisor cases", robots: { index: false, follow: false } };
type Props = { params: Promise<{ locale: string }> };

export default async function AdvisorCasesPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  return <AdvisorCaseConsole initialQueue={await getAdvisorQueueData()} locale={value} />;
}

