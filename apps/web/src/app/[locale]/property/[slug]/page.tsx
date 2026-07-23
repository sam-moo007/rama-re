import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { getPropertyBySlug } from "@/lib/catalogue-data";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyHeader } from "@/features/property/property-header";
import { EvidencePassport } from "@/features/property/evidence-passport";
import { CostsTimeline } from "@/features/property/costs-timeline";
import { RiskAnalysis } from "@/features/property/risk-analysis";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const property = await getPropertyBySlug(slug);
    return {
      title: `${property.name[locale as "en" | "ar"]} — RAMA`,
    };
  } catch {
    return { title: "Property Not Found — RAMA" };
  }
}

export default async function PropertyDecisionRoomPage({ params }: Props) {
  const { locale: value, slug } = await params;
  if (!isLocale(value)) notFound();
  
  const isRtl = value === "ar";

  let property;
  try {
    property = await getPropertyBySlug(slug);
  } catch (error: any) {
    if (error.message === "PROPERTY_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <main lang={value} dir={isRtl ? "rtl" : "ltr"} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <PropertyHeader property={property} locale={value as any} />

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Tabs for Evidence, Costs, Risks */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="evidence" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1">
              <TabsTrigger value="evidence">{isRtl ? "جواز الأدلة" : "Evidence Passport"}</TabsTrigger>
              <TabsTrigger value="costs">{isRtl ? "جدول التكاليف" : "Costs Timeline"}</TabsTrigger>
              <TabsTrigger value="risks">
                {isRtl ? "المخاطر" : "Risks"}
                {property.risks.length > 0 && (
                  <Badge variant="destructive" className="ml-2 rtl:mr-2 rtl:ml-0 h-5 w-5 p-0 flex items-center justify-center rounded-none">
                    {property.risks.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="evidence" className="focus-visible:outline-none focus-visible:ring-0">
              <EvidencePassport claims={property.claims} coverageScore={property.evidenceCoverage} locale={value as any} />
            </TabsContent>
            
            <TabsContent value="costs" className="focus-visible:outline-none focus-visible:ring-0">
              <CostsTimeline costs={property.costs} locale={value as any} />
            </TabsContent>
            
            <TabsContent value="risks" className="focus-visible:outline-none focus-visible:ring-0">
              <RiskAnalysis risks={property.risks} locale={value as any} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar Facts & Fit */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-lg">{isRtl ? "مدى الملاءمة" : "Fit Summary"}</h3>
              <ul className="space-y-3">
                {property.fitReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{reason[isRtl ? "ar" : "en"]}</span>
                  </li>
                ))}
              </ul>
              {property.uncertainConstraint && (
                <div className="mt-4 p-3 bg-background rounded text-sm text-muted-foreground border border-dashed">
                  <strong>{isRtl ? "قيد المراجعة:" : "Under Review:"}</strong>{" "}
                  {property.uncertainConstraint[isRtl ? "ar" : "en"]}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">{isRtl ? "حقائق مثبتة" : "Established Facts"}</h3>
              <div className="space-y-4">
                {property.facts.map((fact, idx) => (
                  <div key={idx} className="flex justify-between items-end border-b pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground">{fact.label[isRtl ? "ar" : "en"]}</span>
                    <div className="text-right">
                      <div className="font-medium">{fact.value[isRtl ? "ar" : "en"]}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{fact.basis}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">{isRtl ? "مستشار الشراء" : "Buying Advisor"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isRtl 
                  ? `الرد متوقع خلال ${property.advisor.responseSlaHours} ساعة` 
                  : `Response expected within ${property.advisor.responseSlaHours} hours`}
              </p>
              
              {property.advisor.openQuestions.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                    {isRtl ? "أسئلة مفتوحة" : "Open Questions"}
                  </h4>
                  <ul className="space-y-2 text-sm">
                    {property.advisor.openQuestions.map((q, idx) => (
                      <li key={idx} className="p-2 bg-background rounded border">{q[isRtl ? "ar" : "en"]}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
