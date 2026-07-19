import { Locale } from "@/lib/i18n";
import Image from "next/image";
import { SiteHeader } from "@/features/property/components/site-header";
import { SnaggingList } from "@/features/owner/components/snagging-list";

export default async function OwnerDashboardPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return (
    <div className="appShell" dir={locale === "ar" ? "rtl" : "ltr"} lang={locale}>
      <SiteHeader locale={locale} slug="owner-dashboard" />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">
          {locale === "ar" ? "لوحة تحكم المالك" : "Owner Dashboard"}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <SnaggingList locale={locale} />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded border p-6">
              <h3 className="font-semibold text-lg mb-4">
                {locale === "ar" ? "تفاصيل العقار" : "Property Details"}
              </h3>
              <p className="text-slate-600 mb-2">Residence 1204, Downtown Dubai</p>
              <div className="relative h-40 bg-slate-100 rounded overflow-hidden border">
                <Image 
                  src="/images/property-living-room.jpg" 
                  alt="Property Image" 
                  fill 
                  style={{ objectFit: 'cover' }} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
