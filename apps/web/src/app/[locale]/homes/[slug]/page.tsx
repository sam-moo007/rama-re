import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyDecisionRoomView } from "@/features/property/components/property-decision-room";
import { isLocale, localize } from "@/lib/i18n";
import { getPropertyBySlug } from "@/lib/property-data";

type PropertyPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) return {};
  const property = await getPropertyBySlug(slug);
  if (!property) return {};

  return {
    title: `${localize(property.name, localeParam)} · ${localize(property.community, localeParam)}`,
    description:
      localeParam === "ar"
        ? "تفاصيل ومستندات وتكاليف العقار الموثقة من راما"
        : "Verified property details, staged buying costs, and location fit on RAMA.",
  };
}

export default async function HomesSlugPage({ params }: PropertyPageProps) {
  const { locale: localeParam, slug } = await params;
  if (!isLocale(localeParam)) notFound();
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: localize(property.name, localeParam),
    description: localize(property.community, localeParam),
    offers: {
      "@type": "Offer",
      price: property.priceAed,
      priceCurrency: "AED",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyDecisionRoomView locale={localeParam} property={property} />
    </>
  );
}
