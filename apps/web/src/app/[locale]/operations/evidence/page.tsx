import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EvidenceOperationsConsole } from "@/features/evidence-operations/components/evidence-operations-console";
import { getEvidenceQueue } from "@/lib/evidence-data";
import { isLocale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evidence Operations",
  robots: { index: false, follow: false },
};

type EvidenceOperationsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function EvidenceOperationsPage({ params }: EvidenceOperationsPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  let queue: Awaited<ReturnType<typeof getEvidenceQueue>> | null = null;
  let loadError: unknown = null;
  try {
    queue = await getEvidenceQueue();
  } catch (error) {
    loadError = error;
  }

  if (!queue) {
    return (
      <main className="operationsUnavailable" dir={localeParam === "ar" ? "rtl" : "ltr"}>
        <p className="eyebrow">RAMA / OPERATIONS</p>
        <h1>{localeParam === "ar" ? "واجهة الأدلة غير متاحة." : "Evidence service is unavailable."}</h1>
        <p>{loadError instanceof Error ? loadError.message : "Unknown evidence-service failure."}</p>
        <a className="primaryButton" href={`/${localeParam}/properties/residence-1204`}>
          {localeParam === "ar" ? "العودة إلى العقار" : "Return to the property"}
        </a>
      </main>
    );
  }

  return <EvidenceOperationsConsole initialQueue={queue} locale={localeParam} />;
}
