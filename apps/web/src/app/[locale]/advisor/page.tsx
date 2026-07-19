import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CustomerAdvisorHandoff } from "@/features/advisor/components/customer-advisor-handoff";
import { getCustomerHandoffData } from "@/lib/decision-case-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Advisor handoff", robots: { index: false, follow: false } };
type Props = { params: Promise<{ locale: string }> };

export default async function AdvisorHandoffPage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const data = await getCustomerHandoffData();
  return <CustomerAdvisorHandoff briefs={data.briefs} catalogue={data.catalogue} cases={data.cases} locale={value} shortlist={data.shortlist.shortlist} />;
}

