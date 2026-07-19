import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EntityResolutionConsole } from "@/features/ingestion-operations/components/entity-resolution-console";
import { isLocale } from "@/lib/i18n";
import { getEntityResolutionQueue } from "@/lib/resolution-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entity Resolution Operations",
  robots: { index: false, follow: false },
};

type ResolutionPageProps = { params: Promise<{ locale: string }> };

export default async function ResolutionPage({ params }: ResolutionPageProps) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) notFound();

  let queue: Awaited<ReturnType<typeof getEntityResolutionQueue>> | null = null;
  let loadError: unknown = null;
  try {
    queue = await getEntityResolutionQueue();
  } catch (error) {
    loadError = error;
  }

  if (!queue) {
    return (
      <main
        className="operationsUnavailable"
        dir={localeParam === "ar" ? "rtl" : "ltr"}
        lang={localeParam}
      >
        <p className="eyebrow">RAMA / ENTITY RESOLUTION</p>
        <h1>
          {localeParam === "ar"
            ? "مساحة مطابقة العقارات غير متاحة."
            : "Entity resolution is unavailable."}
        </h1>
        <p>{loadError instanceof Error ? loadError.message : "Unknown resolution-service failure."}</p>
        <a className="primaryButton" href={`/${localeParam}/operations/evidence`}>
          {localeParam === "ar" ? "العودة إلى عمليات الأدلة" : "Return to evidence operations"}
        </a>
      </main>
    );
  }
  return <EntityResolutionConsole initialQueue={queue} locale={localeParam} />;
}
