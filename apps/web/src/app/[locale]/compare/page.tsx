import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { getCompareData, getDiscoveryData } from "@/lib/catalogue-data";
import { CompareTable } from "@/features/compare/compare-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Compare Properties — RAMA" };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slugs?: string }>;
};

export default async function ComparePage({ params, searchParams }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();

  const isRtl = value === "ar";

  const search = await searchParams;
  let targetSlugs: string[] = [];

  if (search.slugs) {
    targetSlugs = search.slugs.split(",").map(s => s.trim()).filter(Boolean);
  } else {
    // If no slugs in URL, fetch the user's shortlist
    try {
      const { shortlist } = await getDiscoveryData({}); // DiscoveryData fetches search + shortlist
      if (shortlist.shortlist && shortlist.shortlist.propertySlugs.length > 0) {
        targetSlugs = shortlist.shortlist.propertySlugs.slice(0, 4);
      }
    } catch (e) {
      console.error("Failed to fetch shortlist for comparison", e);
    }
  }

  // If there are still less than 2 slugs, show an empty state
  if (targetSlugs.length < 2) {
    return (
      <main lang={value} dir={value === "ar" ? "rtl" : "ltr"} className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
        <h1 className="text-3xl font-bold">
          {isRtl ? "لم يتم تحديد عقارات كافية للمقارنة" : "Not enough properties to compare"}
        </h1>
        <p className="text-muted-foreground max-w-md">
          {isRtl 
            ? "يرجى إضافة ما لا يقل عن عقارين إلى قائمتك المختصرة أو تحديدهم للمقارنة." 
            : "Please add at least 2 properties to your shortlist or select them to compare."}
        </p>
        <Button className="mt-4">
          <Link href={`/${value}/search` as any}>
            {isRtl ? "تصفح العقارات" : "Browse Properties"}
          </Link>
        </Button>
      </main>
    );
  }

  // Fetch comparison data
  try {
    const { compare } = await getCompareData(targetSlugs);

    return (
      <main lang={value} dir={value === "ar" ? "rtl" : "ltr"} className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">
            {value === "ar" ? "مقارنة العقارات" : "Compare Properties"}
          </h1>
          <p className="text-muted-foreground mt-2 md:mt-0">
            {value === "ar" 
              ? `مقارنة ${compare.items.length} عقارات` 
              : `Comparing ${compare.items.length} properties`}
          </p>
        </div>
        <CompareTable properties={compare.items} locale={value as any} />
      </main>
    );
  } catch (error) {
    console.error("Failed to load comparison data:", error);
    return (
      <main lang={value} dir={value === "ar" ? "rtl" : "ltr"} className="p-8 max-w-7xl mx-auto">
        <div className="p-4 bg-destructive/10 text-destructive rounded">
          <h2 className="font-semibold mb-2">{value === "ar" ? "خطأ" : "Error"}</h2>
          <p>{error instanceof Error ? error.message : "Failed to load comparison."}</p>
        </div>
      </main>
    );
  }
}
