import { CheckCircle2, FileText, Landmark, KeySquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteHeader } from "@/features/property/components/site-header";
import { isLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function ReadinessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale: Locale = value as Locale;

  const steps = [
    {
      title: locale === "ar" ? "الموافقة المبدئية" : "Mortgage Pre-Approval",
      description: locale === "ar" ? "احصل على موافقة مبدئية لضمان ميزانيتك" : "Secure your budget with a bank pre-approval.",
      icon: Landmark,
      completed: true,
    },
    {
      title: locale === "ar" ? "تأكيد الهوية" : "Identity Verification",
      description: locale === "ar" ? "رفع المستندات الثبوتية وجواز السفر" : "Upload your Emirates ID and passport copies.",
      icon: FileText,
      completed: true,
    },
    {
      title: locale === "ar" ? "حجز الوحدة" : "Unit Reservation",
      description: locale === "ar" ? "توقيع اتفاقية الحجز ودفع العربون" : "Sign the reservation agreement and transfer the deposit.",
      icon: KeySquare,
      completed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader locale={locale} />
      <main className="container max-w-4xl py-12">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            {locale === "ar" ? "مؤشر الجاهزية" : "Buyer Readiness"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {locale === "ar" ? "تتبع تقدمك نحو امتلاك عقارك الجديد." : "Track your progress towards owning your new property."}
          </p>
        </div>

        <div className="grid gap-6">
          {steps.map((step, index) => (
            <Card key={index} className={step.completed ? "border-green-200 bg-green-50/30" : ""}>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className={`p-2 rounded-full ${step.completed ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center justify-between">
                    {step.title}
                    {step.completed && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base ml-14">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
